const {User, Thought} = require('../models');

module.exports = {
  // Find all thoughts
  async getThoughts(req, res) {
    try {
      const thoughts = await Thought.find();

      return res.json(thoughts);
    } catch (err) {
      console.log(err.message);
      return res.status(500).json({ message: "An error occurred while fetching thoughts" });
    }
  },

  // Find one thought
  async getOneThought(req, res) {
    try {
      const thought = await Thought.findOne({_id: req.params.thoughtId})
        .select('-__v');

      if (!thought) {
        return res.status(404).json({message: `No thought with the id: ${req.params.thoughtId}`});
      }

      return res.json(thought);
    } catch (err) {
      console.log(err);
      return res.status(500).json({ message: "An error occurred while fetching the thought" });
    }
  },

  // Create thought
  async createThought(req, res) {
    try {
      // Basic validation: Ensure all needed fields are provided
      const { thoughtText, userId } = req.body;
      if (!thoughtText || !userId) {
        return res.status(400).json({ message: "Thought text and user ID are required." });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(400).json({ message: "No user with that ID" });
      }

      const thought = await Thought.create(req.body);

      const userUpdate = await User.findByIdAndUpdate(
        userId,
        { $push: { thoughts: thought._id } },
        { new: true }
      );

      // Ensure the user was found and updated
      if (!userUpdate) {
        return res.status(404).json({ message: "User not found, thought not added to user." });
      }

      res.json(thought);
    } catch (err) {
      console.error(err);  // Log error for debugging
      return res.status(500).json({ message: "An error occurred while creating the thought" });
    }
  },

  // Update thought
  async updateThought(req, res) {
    try {
      const thought = await Thought.findOneAndUpdate(
        {_id: req.params.thoughtId}, // filtering criteria
        {$set: req.body}, // update statement
        {runValidators: true, new: true} // options
      );

      // Check if the thought was not found
      if (!thought) {
        return res.status(404).json({message: `No thought with the id: ${req.params.thoughtId}`});
      }

      // Respond with the updated thought
      res.json(thought);
    } catch (err) {
      console.error(err); // Log the error to the console for debugging
      res.status(500).json({ message: "An error occurred while updating the thought" });
    }
  },

  // Delete thought
  async deleteThought(req, res) {
    try {
      const thought = await Thought.findOneAndRemove({_id: req.params.thoughtId});

      if (!thought) {
        return res.status(404).json({message: `No thought with the id: ${req.params.thoughtId}`});
      }

      // Update the user's thoughts array
      await User.updateOne(
        { thoughts: thought._id },
        { $pull: { thoughts: thought._id } }
      );

      return res.json({message: 'Thought and associated reactions successfully deleted'});

    } catch (err) {
      console.log(err);
      return res.status(500).json({ message: "An error occurred while deleting the thought" });
    }
  },

  // Add a reaction to a thought
  async addReaction(req, res) {
    try {
      const { reactionBody, username } = req.body;
      if (!reactionBody || !username) {
        return res.status(400).json({ message: "Reaction body and username are required." });
      }

      // Find the thought and update it
      const thought = await Thought.findOneAndUpdate(
        { _id: req.params.thoughtId },
        { $push: { reactions: req.body } },
        { runValidators: true, new: true }
      );

      // Ensure the thought was found
      if (!thought) {
        return res.status(404).json({ message: `No thought with the id: ${req.params.thoughtId}` });
      }

      // Respond with the updated thought
      res.json(thought);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "An error occurred while adding the reaction" });
    }
  },

  // Remove a reaction from a thought
  async removeReaction(req, res) {
    try {
      // Find the thought and update it
      const thought = await Thought.findOneAndUpdate(
        { _id: req.params.thoughtId },
        { $pull: { reactions: { _id: req.body.reactionId } } },
        { new: true }
      );

      // Ensure the thought was found
      if (!thought) {
        return res.status(404).json({ message: `No thought with the id: ${req.params.thoughtId}` });
      }

      // Respond with the updated thought
      res.json(thought);
    } catch (err) {
      console.error(err); // Log the error for debugging
      return res.status(500).json({ message: "An error occurred while removing the reaction" });
    }
  },
};
