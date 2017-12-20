const path = require('path');
const mkdirp = require('mkdirp');
const fs = require('fs');
const toposort = require('toposort');

class AssetsManifest {
  constructor(options) {
    this.options = {
      path: undefined,
      filename: 'assets-manifest.json',
      extensions: ['js', 'css'],
      prettyPrint: true,
      ...options,
    };
  }

  apply(compiler) {
    compiler.plugin('after-emit', (compilation, callback) => {
      const opts = this.options;
      const conf = compilation.options;
      const base = conf.output.publicPath || '';

      const { chunks } = compilation.getStats().toJson();
      const sortedChunks = this.sortChunks(chunks);
      const manifest = this.mapChunksToManifest(sortedChunks, { publicPath: base });

      const dest = opts.path || conf.output.path;
      const file = path.join(dest, opts.filename);

      const writeFile = (data) => {
        const content = JSON.stringify(data, null, opts.prettyPrint ? 2 : null);
        fs.writeFile(file, content, (err) => {
          if (err) throw err;
          callback();
        });
      };

      mkdirp(dest, () => {
        if (opts.merge) {
          fs.readFile(file, 'utf8', (error, content) => {
            if (error) {
              writeFile(manifest);
            } else {
              const data = JSON.parse(content);
              writeFile({ ...data, ...manifest });
            }
          });
        } else {
          writeFile(manifest);
        }
      });
    });
  }

  sortChunks(chunks) {
    const nodes = {};

    chunks.forEach((chunk) => {
      nodes[chunk.id] = chunk;
    });

    // Next, we add an edge for each parent relationship into the graph
    const edges = [];

    chunks.forEach((chunk) => {
      if (chunk.parents) {
        // Add an edge for each parent (parent -> child)
        chunk.parents.forEach((parentId) => {
          // webpack2 chunk.parents are chunks instead of string id(s)
          const parentChunk = nodes[parentId];
          // If the parent chunk does not exist (e.g. because of an excluded chunk)
          // we ignore that parent
          if (parentChunk) {
            edges.push([parentChunk, chunk]);
          }
        });
      }
    });

    // We now perform a topological sorting on the input chunks and built edges
    return toposort.array(chunks, edges);
  }

  mapChunksToManifest(chunks, manifestOptions = {}) {
    const options = {
      publicPath: '',
      ...manifestOptions,
    };


    const nextElement = ([head, ...tail]) => {
      if (!head) {
        return undefined;
      }

      return {
        id: head.id,
        next: nextElement(tail),
        ...this.options.extensions.reduce((acc, extension) => ({
          ...acc,
          ...this.filterChunkFilesByExtension(head.files, extension, options.publicPath),
        }), {}),
      };
    };

    return nextElement(chunks);
  }

  filterChunkFilesByExtension(files, extension, publicPath) {
    return {
      [extension]: files
        .filter(file => file.endsWith(extension))
        .map(file => path.join(publicPath, file)),
    };
  }
}

module.exports = AssetsManifest;
