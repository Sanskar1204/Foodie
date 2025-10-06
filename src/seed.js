const { connectToDatabase } = require('./db');
const MenuItem = require('./models/MenuItem');

async function run() {
  await connectToDatabase();
  const count = await MenuItem.countDocuments();
  if (count > 0) {
    console.log('Menu already seeded');
    process.exit(0);
  }

  const items = [
    {
      name: 'Margherita Pizza',
      description: 'Classic cheese pizza',
      price: 299,
      category: 'Pizza',
      tags: ['veg', 'cheese'],
      imageUrl: ''
    },
    {
      name: 'Paneer Tikka',
      description: 'Smoky paneer cubes',
      price: 199,
      category: 'Starters',
      tags: ['veg'],
      imageUrl: ''
    },
    {
      name: 'Chicken Biryani',
      description: 'Aromatic rice with chicken',
      price: 349,
      category: 'Biryani',
      tags: ['non-veg'],
      imageUrl: ''
    },
    {
      name: 'Veg Burger',
      description: 'Crispy veg patty burger',
      price: 149,
      category: 'Burger',
      tags: ['veg'],
      imageUrl: ''
    }
  ];

  await MenuItem.insertMany(items);
  console.log('Seeded menu items:', items.length);
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
