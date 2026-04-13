const express = require('express');
const router = express.Router();
const createRoutes = require('./baseRoutes');

router.use('/users', createRoutes(require('../controllers/userController')));
//router.use('/admin/career-paths', createRoutes(require('../controllers/careerController')));
router.use('/career-paths', createRoutes(require('../controllers/careerController')));
router.use('/skills', createRoutes(require('../controllers/skillController')));
router.use('/questions', createRoutes(require('../controllers/questionController')));
router.use('/options', createRoutes(require('../controllers/optionController')));
router.use('/sessions', createRoutes(require('../controllers/sessionController')));
router.use('/answers', createRoutes(require('../controllers/answerController')));
router.use('/roadmaps', createRoutes(require('../controllers/roadmapController')));
router.use('/roadmap-contents', createRoutes(require('../controllers/roadmapContentController')));
router.use('/progress', createRoutes(require('../controllers/progressController')));
router.use('/bookmarks', createRoutes(require('../controllers/bookmarkController')));
router.use('/auth', require('./authRoutes'));

module.exports = router;