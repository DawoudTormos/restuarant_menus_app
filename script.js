document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const themeSelect = document.getElementById('theme-select');
    const cartButton = document.getElementById('cart-button');
    const cartModal = document.getElementById('cart-modal');
    const closeCart = document.getElementById('close-cart');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartCount = document.getElementById('cart-count');
    const cartTotal = document.getElementById('cart-total');
    const menuItemsContainer = document.getElementById('menu-items');
    const categoryTabsContainer = document.getElementById('category-tabs');
    const orderForm = document.getElementById('order-form');
    const restaurantLogo = document.getElementById('restaurant-logo');

    // State
    let cart = [];
    let menuData = {
        categories: [],
        items: [],
        tags: []
    };

    // Themes
    const themes = {
        default: '',
        dark: 'dark-theme',
        light: 'light-theme',
        warm: 'warm-theme',
        cool: 'cool-theme'
    };

    // Initialize
    init();

    function init() {
        setupEventListeners();
        fetchMenuData();
    }

    function setupEventListeners() {
        // Theme selection
        themeSelect.addEventListener('change', function() {
            const selectedTheme = this.value;
            applyTheme(selectedTheme);
        });

        // Cart interactions
        cartButton.addEventListener('click', openCart);
        closeCart.addEventListener('click', closeCartModal);

        // Close modal when clicking outside
        cartModal.addEventListener('click', function(e) {
            if (e.target === cartModal) {
                closeCartModal();
            }
        });

        // Form submission
        orderForm.addEventListener('submit', function(e) {
            e.preventDefault();
            submitOrder();
        });
    }

    function applyTheme(themeName) {
        // Remove all theme classes
        document.body.className = '';
        
        // Apply selected theme
        if (themeName !== 'default') {
            document.body.classList.add(themes[themeName]);
        }
    }

    async function fetchMenuData() {
        try {
            const response = await fetch('http://127.0.0.1:8000/data.json');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const jsonData = await response.json();
    
            // Transform the JSON data into the format your code expects
            const transformedData = {
                categories: jsonData.categories,
                tags: jsonData.tags,
                items: jsonData.items.map(item => {
                    // Convert array of tag IDs to boolean tag properties
                    const tagsObj = {};
                    jsonData.tags.forEach(tag => {
                        tagsObj[tag.name.toLowerCase().replace(' ', '')] = item.tags.includes(tag.id);
                    });
                    
                    return {
                        ...item,
                        tags: tagsObj
                    };
                })
            };
    
            // Process the data
            menuData = transformedData;
            renderCategories();
            renderMenuItems();
        } catch (error) {
            console.error('Error fetching menu data:', error);
            // Fallback to mock data if the fetch fails
            const mockData = {
                categories: [
                    { id: 1, name: 'Appetizers' },
                    { id: 2, name: 'Main Courses' },
                    { id: 3, name: 'Desserts' },
                    { id: 4, name: 'Drinks' }
                ],
                tags: [
                    { id: 1, name: 'Vegetarian' },
                    { id: 2, name: 'Vegan' },
                    { id: 3, name: 'Gluten Free' },
                    { id: 4, name: 'Spicy' },
                    { id: 5, name: 'Lactose Free' }
                ],
                items: [
                    {
                        id: 1,
                        name: 'Bruschetta',
                        description: 'Toasted bread topped with tomatoes, garlic, and fresh basil.',
                        price: 8.99,
                        categoryId: 1,
                        image: 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
                        tags: {
                            vegetarian: true,
                            vegan: false,
                            glutenFree: false,
                            spicy: false,
                            lactoseFree: true
                        }
                    },
                    {
                        id: 2,
                        name: 'Margherita Pizza',
                        description: 'Classic pizza with tomato sauce, mozzarella, and basil.',
                        price: 12.99,
                        categoryId: 2,
                        image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
                        tags: {
                            vegetarian: true,
                            vegan: false,
                            glutenFree: false,
                            spicy: false,
                            lactoseFree: false
                        }
                    }
                ]
            };
            menuData = mockData;
            renderCategories();
            renderMenuItems();
        }
    }

    function renderCategories() {
        categoryTabsContainer.innerHTML = '';
        
        // Add "All" category
        const allTab = document.createElement('div');
        allTab.classList.add('category-tab', 'active');
        allTab.textContent = 'All';
        allTab.addEventListener('click', () => {
            document.querySelectorAll('.category-tab').forEach(tab => tab.classList.remove('active'));
            allTab.classList.add('active');
            renderMenuItems();
        });
        categoryTabsContainer.appendChild(allTab);
        
        // Add other categories
        menuData.categories.forEach(category => {
            const tab = document.createElement('div');
            tab.classList.add('category-tab');
            tab.textContent = category.name;
            tab.dataset.categoryId = category.id;
            tab.addEventListener('click', () => {
                document.querySelectorAll('.category-tab').forEach(tab => tab.classList.remove('active'));
                tab.classList.add('active');
                renderMenuItems(category.id);
            });
            categoryTabsContainer.appendChild(tab);
        });
    }

    function renderMenuItems(categoryId = null) {
        menuItemsContainer.innerHTML = '';
        
        const itemsToShow = categoryId 
            ? menuData.items.filter(item => item.categoryId === categoryId)
            : menuData.items;
        
        itemsToShow.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.classList.add('menu-item');
            
            // Get active tags for this item
            const activeTags = [];
            for (const tag in item.tags) {
                if (item.tags[tag]) {
                    const tagInfo = menuData.tags.find(t => t.id === tag);
                    if (tagInfo) {
                        activeTags.push(tagInfo.name);
                    }
                }
            }
            
            itemElement.innerHTML = `
                <img src="${item.image}" alt="${item.name}" class="item-image">
                <div class="item-details">
                    <h3 class="item-name">${item.name}</h3>
                    <p class="item-description">${item.description}</p>
                    ${activeTags.length > 0 ? `
                        <div class="tags">
                            ${activeTags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                        </div>
                    ` : ''}
                    <div class="item-footer">
                        <span class="item-price">$${item.price.toFixed(2)}</span>
                        <button class="add-to-cart" data-item-id="${item.id}">Add to Cart</button>
                    </div>
                </div>
            `;
            
            menuItemsContainer.appendChild(itemElement);
        });
        
        // Add event listeners to all add-to-cart buttons
        document.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', function() {
                const itemId = parseInt(this.dataset.itemId);
                addToCart(itemId);
            });
        });
    }

    function addToCart(itemId) {
        const item = menuData.items.find(i => i.id === itemId);
        if (!item) return;
        
        const existingItem = cart.find(i => i.id === itemId);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                ...item,
                quantity: 1
            });
        }
        
        updateCart();
    }

    function updateCart() {
        cartCount.textContent = cart.reduce((total, item) => total + item.quantity, 0);
        
        if (cartModal.style.display === 'flex') {
            renderCartItems();
        }
    }

    function openCart() {
        renderCartItems();
        cartModal.style.display = 'flex';
    }

    function closeCartModal() {
        cartModal.style.display = 'none';
    }

    function renderCartItems() {
        cartItemsContainer.innerHTML = '';
        
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p>Your cart is empty</p>';
            cartTotal.textContent = '0.00';
            return;
        }
        
        let total = 0;
        
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            
            const itemElement = document.createElement('div');
            itemElement.classList.add('cart-item');
            itemElement.innerHTML = `
                <div class="cart-item-info">
                    <span class="cart-item-name">${item.name}</span>
                    <span class="cart-item-price">$${item.price.toFixed(2)}</span>
                </div>
                <div class="cart-item-quantity">
                    <button class="quantity-btn minus" data-item-id="${item.id}">-</button>
                    <span>${item.quantity}</span>
                    <button class="quantity-btn plus" data-item-id="${item.id}">+</button>
                    <span class="remove-item" data-item-id="${item.id}">Remove</span>
                </div>
            `;
            
            cartItemsContainer.appendChild(itemElement);
        });
        
        cartTotal.textContent = total.toFixed(2);
        
        // Add event listeners to quantity buttons
        document.querySelectorAll('.quantity-btn.minus').forEach(button => {
            button.addEventListener('click', function() {
                const itemId = parseInt(this.dataset.itemId);
                decreaseQuantity(itemId);
            });
        });
        
        document.querySelectorAll('.quantity-btn.plus').forEach(button => {
            button.addEventListener('click', function() {
                const itemId = parseInt(this.dataset.itemId);
                increaseQuantity(itemId);
            });
        });
        
        document.querySelectorAll('.remove-item').forEach(button => {
            button.addEventListener('click', function() {
                const itemId = parseInt(this.dataset.itemId);
                removeFromCart(itemId);
            });
        });
    }

    function increaseQuantity(itemId) {
        const item = cart.find(i => i.id === itemId);
        if (item) {
            item.quantity += 1;
            updateCart();
        }
    }

    function decreaseQuantity(itemId) {
        const item = cart.find(i => i.id === itemId);
        if (item) {
            if (item.quantity > 1) {
                item.quantity -= 1;
            } else {
                removeFromCart(itemId);
                return;
            }
            updateCart();
        }
    }

    function removeFromCart(itemId) {
        cart = cart.filter(i => i.id !== itemId);
        updateCart();
    }

    function submitOrder() {
        if (cart.length === 0) {
            alert('Your cart is empty!');
            return;
        }
        
        const formData = new FormData(orderForm);
        const customerName = formData.get(0);
        const phoneNumber = formData.get(1);
        const specialInstructions = formData.get(2);
        
        // In a real app, you would send this data to your backend
        console.log('Order submitted:', {
            customer: {
                name: customerName,
                phone: phoneNumber,
                instructions: specialInstructions
            },
            items: cart,
            total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        });
        
        // Show confirmation
        alert(`Thank you, ${customerName}! Your order has been placed. We'll contact you at ${phoneNumber} when it's ready.`);
        
        // Reset cart and close modal
        cart = [];
        updateCart();
        closeCartModal();
        orderForm.reset();
    }

    // Function to update restaurant logo (can be called from outside)
    window.updateRestaurantLogo = function(src) {
        restaurantLogo.src = src;
    };
});