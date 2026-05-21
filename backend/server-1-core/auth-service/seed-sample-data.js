// Using native global fetch available in Node.js 18+

const BASE_URL = 'http://localhost:4000';

async function seed() {
  const args = process.argv.slice(2);
  const email = args[0] || 'admin@insightnexus.com';
  const password = args[1] || 'admin123';

  console.log(`Starting seed process for InsightNexus sample data with user: ${email}...`);

  // 1. Log in as admin
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  if (!loginRes.ok) {
    console.error(`Failed to log in as admin (${email}). Make sure services are running and credentials are correct.`);
    process.exit(1);
  }

  const { token } = await loginRes.json();
  console.log('Successfully authenticated as admin.');

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  // 2. Create Suppliers
  console.log('Creating suppliers...');
  const suppliers = [
    {
      name: 'Global Tech Logistics',
      contact: 'Alice Johnson',
      email: 'alice@globaltech.com',
      address: '123 Silicon Valley Road',
      category: 'Hardware'
    },
    {
      name: 'Apex Storage Solutions',
      contact: 'Bob Smith',
      email: 'bob@apexstorage.com',
      address: '456 Cloud Parkway',
      category: 'Storage'
    }
  ];

  const createdSuppliers = [];
  for (const s of suppliers) {
    const res = await fetch(`${BASE_URL}/supplier`, {
      method: 'POST',
      headers,
      body: JSON.stringify(s)
    });
    if (res.ok) {
      const data = await res.json();
      createdSuppliers.push(data.supplier);
      console.log(`Created supplier: ${data.supplier.name} (${data.supplier._id})`);
    } else {
      console.error(`Failed to create supplier: ${s.name}`, await res.text());
    }
  }

  const globalTech = createdSuppliers.find(s => s.name === 'Global Tech Logistics');
  const apexStorage = createdSuppliers.find(s => s.name === 'Apex Storage Solutions');

  // 3. Create Inventory Items
  console.log('Creating inventory items...');
  const items = [
    {
      name: 'Core Switch 24-Port',
      category: 'Hardware',
      quantity: 15,
      unitPrice: 450,
      reorderLevel: 5,
      reorderQuantity: 10,
      unit: 'pcs',
      supplierId: globalTech ? globalTech._id : null
    },
    {
      name: 'SSD 1TB NVMe',
      category: 'Storage',
      quantity: 4, // Below reorder level (8) to trigger alert
      unitPrice: 120,
      reorderLevel: 8,
      reorderQuantity: 15,
      unit: 'pcs',
      supplierId: apexStorage ? apexStorage._id : null
    },
    {
      name: 'Cat6a Cable 100m',
      category: 'Cables',
      quantity: 12,
      unitPrice: 75,
      reorderLevel: 5,
      reorderQuantity: 10,
      unit: 'boxes',
      supplierId: globalTech ? globalTech._id : null
    }
  ];

  const createdItems = [];
  for (const item of items) {
    const res = await fetch(`${BASE_URL}/inventory`, {
      method: 'POST',
      headers,
      body: JSON.stringify(item)
    });
    if (res.ok) {
      const data = await res.json();
      createdItems.push(data.item);
      console.log(`Created item: ${data.item.name} (${data.item._id})`);
    } else {
      console.error(`Failed to create item: ${item.name}`, await res.text());
    }
  }

  const ssdItem = createdItems.find(i => i.name === 'SSD 1TB NVMe');

  // 4. Create Transactions
  console.log('Creating finance transactions...');
  const txs = [
    {
      type: 'income',
      amount: 15000,
      category: 'SaaS Renewal',
      description: 'Q2 SaaS licensing renewals for Enterprise customers'
    },
    {
      type: 'income',
      amount: 35000,
      category: 'Consulting Service',
      description: 'Cloud migration advisory service delivery'
    },
    {
      type: 'expense',
      amount: 4200,
      category: 'Office Rent',
      description: 'Main office headquarters rental payment'
    },
    {
      type: 'expense',
      amount: 1850,
      category: 'Internet & Hosting',
      description: 'Dedicated AWS hosting and fiber bandwidth charges'
    }
  ];

  for (const tx of txs) {
    const res = await fetch(`${BASE_URL}/finance`, {
      method: 'POST',
      headers,
      body: JSON.stringify(tx)
    });
    if (res.ok) {
      console.log(`Recorded transaction: ${tx.type} - $${tx.amount} (${tx.category})`);
    } else {
      console.error(`Failed to create transaction: ${tx.category}`, await res.text());
    }
  }

  // 5. Create Purchase Orders
  if (apexStorage && ssdItem) {
    console.log('Creating a pending purchase order to simulate ordered flow...');
    const po = {
      supplierId: apexStorage._id,
      items: [
        {
          itemId: ssdItem._id,
          quantity: 15
        }
      ],
      expectedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 7 days from now
    };

    const res = await fetch(`${BASE_URL}/procurement`, {
      method: 'POST',
      headers,
      body: JSON.stringify(po)
    });
    if (res.ok) {
      const data = await res.json();
      console.log(`Created pending Purchase Order: PO-${data.order._id.slice(-6).toUpperCase()}`);
    } else {
      console.error('Failed to create purchase order', await res.text());
    }
  }

  console.log('\nSeeding completed successfully! Refresh your browser to see the data.');
}

seed().catch(err => {
  console.error('Seeding encountered an error:', err);
});
