const AssetsManifest = require('../src/assets-manifest');

describe('AssetsManifest', () => {
  it('has default options', () => {
    const plugin = new AssetsManifest();

    expect(plugin.options).toEqual({
      path: undefined,
      filename: 'assets-manifest.json',
      extensions: ['js', 'css'],
      prettyPrint: true,
      metadata: undefined,
    });
  });

  describe('Sorting chunks', () => {
    it('sorts chunks by dependency', () => {
      const plugin = new AssetsManifest();
      const chunks = [
        {
          id: 'level-3',
          parents: ['level-2'],
        },
        {
          id: 'level-2',
          parents: ['level-1'],
        },
        {
          id: 'level-1',
          parents: [],
        },
      ];

      expect(plugin.sortChunks(chunks)).toEqual([
        {
          id: 'level-1',
          parents: [],
        },
        {
          id: 'level-2',
          parents: ['level-1'],
        },
        {
          id: 'level-3',
          parents: ['level-2'],
        },
      ]);
    });
  });

  describe('Extracting manifest from chunk structure', () => {
    it('maps a chunk array to a recursive manifest object', () => {
      const plugin = new AssetsManifest();
      const chunks = [
        {
          id: 'level-1',
          files: [],
        },
        {
          id: 'level-2',
          files: [],
        },
        {
          id: 'level-3',
          files: [],
        },
      ];

      expect(plugin.mapChunksToManifest(chunks)).toEqual({
        id: 'level-1',
        js: [],
        css: [],
        next: {
          id: 'level-2',
          js: [],
          css: [],
          next: {
            id: 'level-3',
            js: [],
            css: [],
            next: null,
          },
        },
      });
    });

    it('maps only the whitelisted file extensions', () => {
      const plugin = new AssetsManifest({
        extensions: ['js'],
      });
      const chunks = [
        {
          id: 'chunk',
          files: [
            'index.css',
            'index.js',
          ],
        },
      ];

      expect(plugin.mapChunksToManifest(chunks)).toEqual({
        id: 'chunk',
        js: ['index.js'],
        next: null,
      });
    });

    it('does not map file information if there is no whitelisted format', () => {
      const plugin = new AssetsManifest({
        extensions: [],
      });
      const chunks = [
        {
          id: 'chunk',
          files: [
            'index.css',
            'index.js',
          ],
        },
      ];

      expect(plugin.mapChunksToManifest(chunks)).toEqual({
        id: 'chunk',
        next: null,
      });
    });

    it('adds the publicPath option on each file name', () => {
      const plugin = new AssetsManifest();
      const chunks = [
        {
          id: 'chunk',
          files: [
            'index.css',
            'index.js',
          ],
        },
      ];

      expect(plugin.mapChunksToManifest(chunks, { publicPath: 'a_path' })).toEqual({
        id: 'chunk',
        js: [
          'a_path/index.js',
        ],
        css: [
          'a_path/index.css',
        ],
        next: null,
      });
    });
  });
});
