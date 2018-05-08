const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

// Post Model
const Post = require("./../../models/Post");
const Profile = require("./../../models/Profile");

// Validation
const validatePostInput = require("./../../validation/post");

// @route   GET api/posts/test
// @desc    Tests post route
// @access  Public
router.get("/test", (req, res) => {
  res.json({ msg: "Posts works" });
});

// @route   GET api/posts/
// @desc    Get all posts
// @access  Public
router.get("/", (req, res) => {
  let skip = parseInt(req.query.skip);
  let limit = parseInt(req.query.limit);

  Post.find()
    .sort({ date: -1 })
    .skip(skip)
    .limit(limit)
    .then(posts => {
      res.json(posts);
    })
    .catch(err => {
      res.json(err);
    });
});

// @route   GET api/posts/:id
// @desc    Get post by id
// @access  Public
router.get("/:id", (req, res) => {
  Post.findById(req.params.id)
    .then(post => {
      res.json(post);
    })
    .catch(err => {
      res.json({ nopostfound: "No post found with that id" });
    });
});

// @route   POST api/posts/
// @desc    Create Post
// @access  Private
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);

    if (!isValid) {
      return res.status(400).json(errors);
    }

    const newPost = new Post({
      //likes and comments will be created as empty arrays by default
      text: req.body.text,
      name: req.body.name,
      avatar: req.body.avatar,
      user: req.user.id
    });

    newPost.save().then(post => {
      res.json(post);
    });
  }
);

// @route   DELETE api/posts/:id
// @desc    Delete Post
// @access  Private
router.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        return Post.findById(req.params.id);
      })
      .then(post => {
        //Check for post owner
        if (post.user.toString() !== req.user.id) {
          return res.status(401).json({ notauthorized: "User not authorized" });
        }

        // Delete
        return post.remove().then(() => res.json({ success: true }));
      })
      .catch(err => {
        res.status(404).json({ postnotfound: "No post found" });
      });
  }
);

// @route   POST api/posts/like/:id
// @desc    Like post
// @access  Private
router.post(
  "/like/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        return Post.findById(req.params.id);
      })
      .then(post => {
        if (
          post.likes.filter(like => like.user.toString() === req.user.id)
            .length > 0
        ) {
          return res
            .status(400)
            .json({ alreadyliked: "User already liked this post" });
        }

        // Add user id to likes array
        post.likes.unshift({ user: req.user.id });
        post.save().then(post => res.json(post));
      })
      .catch(err => {
        res.status(404).json({ postnotfound: "No post found" });
      });
  }
);

// @route   POST api/posts/unlike/:id
// @desc    unlike post
// @access  Private
router.post(
  "/unlike/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        return Post.findById(req.params.id);
      })
      .then(post => {
        if (
          post.likes.filter(like => like.user.toString() === req.user.id)
            .length === 0
        ) {
          return res
            .status(400)
            .json({ notliked: "You have not yet liked this post" });
        }

        //Get remove index
        const removeIndex = post.likes
          .map(item => item.user.toString())
          .indexOf(req.user.id);

        if (removeIndex === -1) {
          return res.status(404).json({
            error: "There is no like with this User ID"
          });
        }

        post.likes.splice(removeIndex, 1);
        post.save().then(post => res.json(post));
      })
      .catch(err => {
        res.status(404).json({ postnotfound: "No post found" });
      });
  }
);

// @route   POST api/posts/comment/:id
// @desc    Add comment to post
// @access  Private
router.post(
  "/comment/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);

    if (!isValid) {
      return res.status(400).json(errors);
    }

    Post.findById(req.params.id)
      .then(post => {
        const newComment = {
          user: req.user.id,
          text: req.body.text,
          name: req.body.name,
          avatar: req.body.avatar
        };

        //Add to comments array
        post.comments.unshift(newComment);
        post.save().then(post => res.json(post));
      })
      .catch(err => res.json({ postnotfound: "No post found" }));
  }
);

// @route   DELETE api/posts/comment/:id/:comment_id
// @desc    Remove comment from post
// @access  Private
router.delete(
  "/comment/:id/:comment_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Post.findById(req.params.id)
      .then(post => {
        //Make sure the comment exists
        if (
          post.comments.filter(
            comment => comment._id.toString() === req.params.comment_id
          ).length === 0
        ) {
          return res
            .status(404)
            .json({ commentnotexists: "Comment does not exist" });
        }

        const removeIndex = post.comments
          .map(comment => comment._id.toString())
          .indexOf(req.params.comment_id);

        //Make sure only the comment owner can delete comment
        if (req.user.id !== post.comments[removeIndex].user.toString()) {
          return res.status(401).json({ notauthorized: "User not authorized" });
        }

        post.comments.splice(removeIndex, 1);
        post.save().then(post => res.json(post));
      })
      .catch(err => res.json({ postnotfound: "No post found" }));
  }
);

module.exports = router;
