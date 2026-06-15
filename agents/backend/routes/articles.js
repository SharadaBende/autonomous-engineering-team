// backend/routes/articles.js

const express = require('express');
const router = express.Router();
const articleController = require('../controllers/articleController');
const authMiddleware = require('../middlewares/authMiddleware');
const errorHandlingMiddleware = require('../middlewares/errorHandlingMiddleware');

// Get all articles
router.get('/', async (req, res, next) => {
  try {
    const articles = await articleController.getAllArticles();
    res.status(200).json(articles);
  } catch (error) {
    next(error);
  }
});

// Get article by id
router.get('/:id', async (req, res, next) => {
  try {
    const id = req.params.id;
    const article = await articleController.getArticleById(id);
    if (!article) {
      res.status(404).json({ message: 'Article not found' });
    } else {
      res.status(200).json(article);
    }
  } catch (error) {
    next(error);
  }
});

// Create new article
router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const articleData = req.body;
    const newArticle = await articleController.createArticle(articleData);
    res.status(201).json(newArticle);
  } catch (error) {
    next(error);
  }
});

// Update article
router.put('/:id', authMiddleware, async (req, res, next) => {
  try {
    const id = req.params.id;
    const articleData = req.body;
    const updatedArticle = await articleController.updateArticle(id, articleData);
    if (!updatedArticle) {
      res.status(404).json({ message: 'Article not found' });
    } else {
      res.status(200).json(updatedArticle);
    }
  } catch (error) {
    next(error);
  }
});

// Delete article
router.delete('/:id', authMiddleware, async (req, res, next) => {
  try {
    const id = req.params.id;
    const deletedArticle = await articleController.deleteArticle(id);
    if (!deletedArticle) {
      res.status(404).json({ message: 'Article not found' });
    } else {
      res.status(204).json();
    }
  } catch (error) {
    next(error);
  }
});

// Error handling middleware
router.use(errorHandlingMiddleware);

module.exports = router;