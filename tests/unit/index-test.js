const { assert } = require('chai');
const mock = require('mock-require');
const { join } = require('path');

describe('handler', () => {
  let app;
  let protocol;
  let onAppReady;
  let protocolName;
  let handlerOptions;

  function register(options) {
    require('../..')(Object.assign({
      cwd: '.',
      app,
      protocol,
    }, options));
  }

  before(() => {
    mock('../../lib/handler', options => handlerOptions = options);
  });

  after(() => {
    mock.stop('../../lib/handler');
  });

  beforeEach(() => {
    app = {
      on(evt, cb) {
        if (evt === 'ready') {
          onAppReady = cb;
        }
      },
    };

    protocol = {
      registerFileProtocol(name/*, handler, errorHandler*/) {
        protocolName = name;
      },
    };
  });

  it('works', () => {
    register();
    assert.ok(onAppReady);
    onAppReady();

    assert.equal(protocolName, 'serve');
    assert.deepEqual(handlerOptions, {
      cwd: '.',
      name: 'serve',
      endpoint: 'dist',
      directoryIndexFile: 'index.html',
      indexPath: undefined,
    });
  });

  it('works with non-default arguments', () => {
    register({
      cwd: join('my', 'old'),
      name: 'friend',
      endpoint: 'so',
      directoryIndexFile: 'we.html',
      indexPath: join('meet', 'again'),
    });
    assert.ok(onAppReady);
    onAppReady();

    assert.equal(protocolName, 'friend');
    assert.deepEqual(handlerOptions, {
      cwd: join('my', 'old'),
      name: 'friend',
      endpoint: 'so',
      directoryIndexFile: 'we.html',
      indexPath: join('meet', 'again'),
    });
  });

  it('required a cwd', () => {
    assert.throws(() => register({ cwd: undefined }));
  });

  it('required an app', () => {
    assert.throws(() => register({ app: undefined }));
  });

  it('required a protocol', () => {
    assert.throws(() => register({ protocol: undefined }));
  });
});
