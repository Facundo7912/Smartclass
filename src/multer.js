import multer from 'multer';

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['.pdf', '.docx'];
  const extension = file.originalname.toLowerCase().slice(file.originalname.lastIndexOf('.'));

  if (allowedTypes.includes(extension)) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos PDF o DOCX.'));
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter,
});

export const uploadSingle = upload.single('file');
export default uploadSingle;
