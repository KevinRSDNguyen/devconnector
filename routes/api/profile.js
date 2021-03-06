const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");
const prependHttp = require("prepend-http");

//Load Validation
const validateProfileInput = require("./../../validation/profile");
const validateExperienceInput = require("./../../validation/experience");
const validateEducationInput = require("./../../validation/education");

//Load Models
const Profile = require("./../../models/Profile");
const User = require("./../../models/User");

// @route   GET api/profile/test
// @desc    Tests profile route
// @access  Public
router.get("/test", (req, res) => {
  res.json({ msg: "Profile works" });
});

// @route   GET api/profile
// @desc    Get current users profile
// @access  Private
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const errors = {};

    Profile.findOne({ user: req.user.id })
      .populate("user", ["name", "avatar"])
      .then(profile => {
        if (!profile) {
          errors.noprofile = "There is no profile for this user";
          return res.status(404).json(errors);
        }
        res.json(profile);
      })
      .catch(err => {
        res.status(404).json(err);
      });
  }
);

// @route   GET api/profile/all
// @desc    Get all profiles
// @access  Public
router.get("/all", (req, res) => {
  let skip = parseInt(req.query.skip);
  let limit = parseInt(req.query.limit);
  const errors = {};

  Profile.find()
    .populate("user", ["name", "avatar"])
    .sort({ date: -1 })
    .skip(skip)
    .limit(limit)
    .then(profiles => {
      if (!profiles) {
        errors.noprofile = "There are no profiles for this user";
        return res.status(404).json(errors);
      }

      res.json(profiles);
    })
    .catch(err => {
      errors.noprofile = "There are no profiles";
      return res.status(404).json(errors);
    });
});

// @route   GET api/profile/handle/:handle
// @desc    Get profile by handle
// @access  Public
router.get("/handle/:handle", (req, res) => {
  const errors = {};

  Profile.findOne({ handle: req.params.handle })
    .populate("user", ["name", "avatar"])
    .then(profile => {
      if (!profile) {
        errors.noprofile = "There is no profile for this user";
        return res.status(404).json(errors);
      }

      res.json(profile);
    })
    .catch(err => {
      errors.noprofile = "There is no profile for this user";
      return res.status(404).json(errors);
    });
});

// @route   GET api/profile/user/:user_id
// @desc    Get profile by User Id
// @access  Public
router.get("/user/:user_id", (req, res) => {
  const errors = {};

  Profile.findOne({ user: req.params.user_id })
    .populate("user", ["name", "avatar"])
    .then(profile => {
      if (!profile) {
        errors.noprofile = "There is no profile for this user";
        return res.status(404).json(errors);
      }

      res.json(profile);
    })
    .catch(err => {
      errors.noprofile = "There is no profile for this user";
      return res.status(404).json(errors);
    });
});

// @route   POST api/profile
// @desc    Create or Edit User Profile
// @access  Private
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateProfileInput(req.body);

    if (!isValid) {
      return res.status(400).json(errors);
    }

    //Get fields
    const profileFields = {}; //Ensure only approved fields get saved. So no req.body.meow, etc.
    profileFields.user = req.user.id;
    if (req.body.handle) profileFields.handle = req.body.handle;
    if (req.body.company) profileFields.company = req.body.company;
    if (req.body.website) profileFields.website = req.body.website;
    if (req.body.location) profileFields.location = req.body.location;
    if (req.body.bio) profileFields.bio = req.body.bio;
    if (req.body.status) profileFields.status = req.body.status;
    if (req.body.githubusername)
      profileFields.githubusername = req.body.githubusername;
    // Skills - Split into array
    if (req.body.skills) {
      profileFields.skills = req.body.skills.split(",");
    }

    // Social
    profileFields.social = {};
    if (req.body.youtube)
      profileFields.social.youtube = prependHttp(req.body.youtube, {
        https: true
      });
    if (req.body.twitter)
      profileFields.social.twitter = prependHttp(req.body.twitter, {
        https: true
      });
    if (req.body.facebook)
      profileFields.social.facebook = prependHttp(req.body.facebook, {
        https: true
      });
    if (req.body.linkedin)
      profileFields.social.linkedin = prependHttp(req.body.linkedin, {
        https: true
      });
    if (req.body.instagram)
      profileFields.social.instagram = prependHttp(req.body.instagram, {
        https: true
      });

    Profile.findOne({ user: req.user.id }).then(profile => {
      if (profile) {
        //Check if Handle exists
        Profile.findOne({ handle: profileFields.handle }).then(profile => {
          if (profile && req.user.id !== profile.user.toString()) {
            errors.handle = "That handle already exists";
            return res.status(400).json(errors);
          }
          //Update
          Profile.findOneAndUpdate({ user: req.user.id }, profileFields, {
            new: true
          }).then(profile => res.json(profile));
        });
      } else {
        //Create

        //Check if Handle exists
        Profile.findOne({ handle: profileFields.handle }).then(profile => {
          if (profile) {
            errors.handle = "That handle already exists";
            return res.status(400).json(errors);
          }

          //Save Profile
          new Profile(profileFields).save().then(profile => res.json(profile));
        });
      }
    });
  }
);

// @route   POST api/profile/experience
// @desc    Add experience to profile
// @access  Private
router.post(
  "/experience",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateExperienceInput(req.body);

    if (!isValid) {
      return res.status(400).json(errors);
    }

    Profile.findOne({ user: req.user.id }).then(profile => {
      if (profile) {
        const newExp = {
          title: req.body.title,
          company: req.body.company,
          location: req.body.location,
          from: req.body.from,
          to: req.body.to,
          current: req.body.current,
          description: req.body.description
        };

        // Add to exp array
        profile.experience.unshift(newExp);
        profile.save().then(profile => {
          res.json(profile);
        });
      } else {
        errors.noprofile = "You do not have a profile to add an experience to.";
        res.status(400).json(errors);
      }
    });
  }
);

// @route   POST api/profile/education
// @desc    Add education to profile
// @access  Private
router.post(
  "/education",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateEducationInput(req.body);

    if (!isValid) {
      return res.status(400).json(errors);
    }

    Profile.findOne({ user: req.user.id }).then(profile => {
      if (profile) {
        const newEdu = {
          school: req.body.school,
          degree: req.body.degree,
          fieldofstudy: req.body.fieldofstudy,
          from: req.body.from,
          to: req.body.to,
          current: req.body.current,
          description: req.body.description
        };

        // Add to exp array
        profile.education.unshift(newEdu);
        profile.save().then(profile => {
          res.json(profile);
        });
      } else {
        errors.noprofile = "You do not have a profile to add an education to.";
        res.status(400).json(errors);
      }
    });
  }
);

// @route   DELETE api/profile/experience/:exp_id
// @desc    Delete experience from profile
// @access  Private
router.delete(
  "/experience/:exp_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        const removeIndex = profile.experience
          .map(item => item.id)
          .indexOf(req.params.exp_id);

        if (removeIndex === -1) {
          return res.status(404).json({
            error: "There is no experience with this ID"
          });
        }

        profile.experience.splice(removeIndex, 1);
        profile.save().then(profile => {
          res.json(profile);
        });
      })
      .catch(err => {
        res.json(err);
      });
  }
);

// @route   DELETE api/profile/education/:edu_id
// @desc    Delete education from profile
// @access  Private
router.delete(
  "/education/:edu_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        const removeIndex = profile.education
          .map(item => item.id)
          .indexOf(req.params.edu_id);

        if (removeIndex === -1) {
          return res.status(404).json({
            error: "There is no education with this ID"
          });
        }

        profile.education.splice(removeIndex, 1);
        profile.save().then(profile => {
          res.json(profile);
        });
      })
      .catch(err => {
        res.json(err);
      });
  }
);

// @route   DELETE api/profile
// @desc    Delete user and profile
// @access  Private
router.delete(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOneAndRemove({ user: req.user.id })
      .then(() => {
        return User.findOneAndRemove({ _id: req.user.id });
      })
      .then(() => {
        res.json({ success: true });
      })
      .catch(err => {
        res.json(err);
      });
  }
);

module.exports = router;
