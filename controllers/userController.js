const {User, Thought} = require('../models');

module.exports = {
  // Find all users
  async getUsers(req, res) {
    try {
      const users = await User.find();
      return res.json(users);
    } catch (err) {
      console.log(err.message);
      return res.status(500).json(err);
    }
  },

  // Find one user
  async getOneUser(req, res) {
    try {
      const user = await User.findOne({_id: req.params.userId})
        .select('-__v')
        .populate('thoughts')
        .populate('friends');

      if (!user) {
        return res.status(404).json({message: `No user with the id: ${req.params.userId}`});
      }

      return res.json(user);
    } catch (err) {
      console.log(err);
      return res.status(500).json(err);
    }
  },

  // Create user
  async createUser(req, res) {
    try {
      const user = await User.create(req.body);
      res.json(user);
    } catch (err) {
      res.status(500).json(err);
    }
  },

  // Update user
  async updateUser(req, res) {
    try {
      const user = await User.findOneAndUpdate(
        {_id: req.params.userId},
        {$set: req.body},
        {runValidators: true, new: true}
      );

      if (!user) {
        return res.status(404).json({message: `No user with the id: ${req.params.userId}`})
      }

      res.json(user);
    } catch (err) {
      res.status(500).json(err);
    }
  },

  // Delete user
  async deleteUser(req, res) {
    try {
      const user = await User.findOneAndRemove({_id: req.params.userId});

      if (!user) {
        return res.status(404).json({message: `No user with the id: ${req.params.userId}`});
      }

      // If user has thoughts, delete them
      if (user.thoughts.length > 0) {
        await Thought.deleteMany({_id: {$in: user.thoughts}});
      }

      return res.json({message: 'User and associated thoughts successfully deleted'});
    } catch (err) {
      console.log(err);
      return res.status(500).json(err);
    }
  },

  // Add a friend to a user
  async addFriend(req, res) {
    try {
      // Check to prevent adding self as a friend
      if (req.params.userId === req.params.friendId) {
        return res.status(400).json({message: 'You cannot add yourself as a friend!'});
      }

      // Ensure the friend to be added exists
      const newFriend = await User.findById(req.params.friendId);
      if (!newFriend) {
        return res.status(404).json({message: `No user with the id: ${req.params.friendId} found`});
      }

      const user = await User.findById(req.params.userId);

      // Check if user exists
      if (!user) {
        return res.status(404).json({message: `No user with the id: ${req.params.userId} found`});
      }

      // Check if friend is already added
      if (user.friends.includes(req.params.friendId)) {
        return res.status(400).json({message: 'Friend already added!'});
      }

      // Add the friend to the user's friend list
      user.friends.push(req.params.friendId);
      await user.save();

      // Fetch the updated user data and populate the 'friends' field to return friend details
      const populatedUser = await User.findById(req.params.userId)
        .populate({
          path: 'friends',
          select: '_id username'
        });

      res.json(populatedUser);

    } catch (err) {
      console.log(err);
      return res.status(500).json(err);
    }
  },

  // Delete a friend from a user
  async removeFriend(req, res) {
    try {
      // Ensure the friend to be deleted exists
      const deleteFriend = await User.findById(req.params.friendId);
      if (!deleteFriend) {
        return res.status(404).json({message: `No user with the id: ${req.params.friendId} found`});
      }

      const user = await User.findById(req.params.userId);

      // Check if user exists
      if (!user) {
        return res.status(404).json({message: `No user with the id: ${req.params.userId} found`});
      }

      // Check if friend is in the array
      if (!user.friends.includes(req.params.friendId)) {
        return res.status(400).json({message: `You're not friends!`});
      }

      // Remove the friend to the user's friend list
      const indexToRemove = user.friends.indexOf(req.params.friendId);
      user.friends.splice(indexToRemove, 1);
      await user.save();

      // Fetch the updated user data and populate the 'friends' field to return friend details
      const populatedUser = await User.findById(req.params.userId)
        .populate({
          path: 'friends',
          select: '_id username'  // Select only '_id' and 'username'
        });

      res.json(populatedUser);

    } catch (err) {
      console.log(err);
      return res.status(500).json(err);
    }
  },
};
