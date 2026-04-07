const app = require("./app");
// const dotenv = require('dotenv');

// dotenv.config({ path: require('path').join(__dirname, '..', '..', '.env') });

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
