//src/middleware/uploads.ts

import multer from 'multer';
export const upload = multer({ dest: 'uploads/' });
