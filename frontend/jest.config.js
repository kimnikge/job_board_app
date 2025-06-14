export default {
  moduleFileExtensions: ['js', 'json', 'vue'],
  transform: {
    // vue-файлы не обрабатываются, так как vue-jest удалён
    '^.+\\.[jt]s$': 'babel-jest'
  },
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  transformIgnorePatterns: ['/node_modules/(?!@vue/)'],
  collectCoverage: false
}
