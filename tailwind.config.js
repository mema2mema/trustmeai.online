export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: { brand: { DEFAULT: '#16a34a', fg: '#065f46' } },
      borderRadius: { '2xl': '1rem' },
      boxShadow: { soft: '0 4px 20px rgba(2, 6, 23, .06)' }
    }
  },
  plugins: []
};
