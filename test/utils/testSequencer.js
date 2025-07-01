const TestSequencer = require('@jest/test-sequencer').default;

class CustomSequencer extends TestSequencer {
  sort(tests) {
    const order = [
      'test/modules/auth/auth.service.spec.ts',
      'test/modules/accounts/accounts.service.spec.ts',
      'test/modules/keywords/keywords.service.spec.ts',
      'test/modules/invitations/invitations.service.spec.ts',
    ];

    return tests.sort((a, b) => {
      const aPath = a.path.split('/').slice(-4).join('/');
      const bPath = b.path.split('/').slice(-4).join('/');
      return order.indexOf(aPath) - order.indexOf(bPath);
    });
  }

  cacheResults(tests, results) {
    super.cacheResults(tests, results);
  }
}

module.exports = CustomSequencer;
