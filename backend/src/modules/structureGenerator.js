const fs = require('fs');
const path = require('path');


const structureGenerator = (basePath) => {
  const files = [
    'repository.ts',
    'service.ts',
    'controller.ts',
    'routes.ts',
    'validation.ts',
    'types.ts',
    'constants.ts',
    'index.ts'
  ];

  files.forEach((file) => {
    const filePath = path.join(basePath, file);
    fs.writeFileSync(filePath, '');
  });
};

const directories = [
  'profile'
];

directories.forEach((dir) => {
  const dirPath = path.join(__dirname, dir);
    structureGenerator(dirPath);
});