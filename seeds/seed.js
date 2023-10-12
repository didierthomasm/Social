const db = require('../config/connection');
const { User, Thought } = require('../models');

const userSeed = [
  { username: 'Luke', email: 'luke@rebellion.com' },
  { username: 'Leia', email: 'leia@rebellion.com' },
  { username: 'Vader', email: 'vader@empire.com' },
  { username: 'Yoda', email: 'yoda@rebellion.com' },
  { username: 'ObiWan', email: 'obiwan@rebellion.com' },
];

const thoughtSeed = [
  { thoughtText: 'May the force be with you.', username: 'Luke' },
  { thoughtText: 'I am your father.', username: 'Vader' },
  { thoughtText: 'Fear is the path to the dark side. Fear leads to anger. Anger leads to hate. Hate leads to suffering.', username: 'Yoda' },
  { thoughtText: 'In my experience, there is no such thing as luck.', username: 'ObiWan' },
];

const seedDatabase = async () => {
  try {
    await User.deleteMany({});
    await Thought.deleteMany({});

    const createdUsers = await User.create(userSeed);

    const createdThoughts = await Thought.create(thoughtSeed);

    // Link thoughts with users
    for (const thought of createdThoughts) {
      const user = createdUsers.find((user) => user.username === thought.username);
      if (user) {
        user.thoughts.push(thought._id);
        await user.save();
      }
    }

    console.log('Users: ', createdUsers);
    console.log('Thoughts: ', createdThoughts)
    console.log('Database seeded!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedDatabase();


/*const userCount = await User.countDocuments({});
const thoughtCount = await Thought.countDocuments({});

if (userCount > 0 || thoughtCount > 0) {
  console.log('Database has existing data, aborting seed operation.');
  process.exit(0);
}*/