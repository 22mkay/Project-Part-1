
document.addEventListener('DOMContentLoaded', () => {

    // --- 1. DYNAMIC SEARCH FUNCTIONALITY (Part 2.2) ---
    const searchInput = document.getElementById('searchInput');
    const productCards = document.querySelectorAll('.product-card');

    if (searchInput) {
        searchInput.addEventListener('keyup', function(e) {
            const searchString = e.target.value.toLowerCase();

            // 1. Filter the individual product cards
            productCards.forEach(card => {
                const title = card.querySelector('h3').innerText.toLowerCase();
                if (title.includes(searchString)) {
                    card.style.display = 'block'; 
                } else {
                    card.style.display = 'none';
                }
            });

            // 2. Hide empty categories (Streetwear, Retro, Performance)
            document.querySelectorAll('section.products').forEach(section => {
                // Find how many cards are currently visible in this specific section
                const visibleCards = Array.from(section.querySelectorAll('.product-card'))
                                          .filter(card => card.style.display !== 'none');
                
                // If there are no visible cards, hide the whole section (including the h2 title)
                if (visibleCards.length === 0) {
                    section.style.display = 'none';
                } else {
                    section.style.display = 'block';
                }
            });
            
            // 3. Hide all <hr> tags while searching to keep the layout clean
            document.querySelectorAll('main hr').forEach(hr => {
                if (searchString.length > 0) {
                    hr.style.display = 'none';
                } else {
                    hr.style.display = 'block';
                }
            });
        });
    }

    // --- 2. FULLY DYNAMIC SHOPPING CART (Part 2.2 & DOM Manipulation) ---
    
    const cartCountElement = document.getElementById('cart-count');
    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');

    // 1. Initialize cart array from storage (or start empty)
    let cartItems = JSON.parse(localStorage.getItem('draftCart')) || [];

    // 2. Function to update the red notification badge in the nav
    function updateCartBadge() {
        if(cartCountElement) {
            let totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
            cartCountElement.innerText = totalItems;
        }
    }
    updateCartBadge(); // Run immediately on every page load

    // 3. Add to Cart Logic (Used on index.html / shop.html)
    addToCartButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            // Find the closest product card to the clicked button
            const card = e.target.closest('.product-card');
            if(!card) return;

            // Scrape the product details from the HTML
            const name = card.querySelector('h3').innerText;
            const priceText = card.querySelector('p').innerText;
            // Clean the price string (remove 'R' and commas) to do math
            const price = parseFloat(priceText.replace('R', '').replace(/,/g, ''));
            const imgSrc = card.querySelector('img').src;

            // Check if shoe is already in cart, if yes, just add to quantity
            const existingItem = cartItems.find(item => item.name === name);
            if(existingItem) {
                existingItem.quantity += 1;
            } else {
                // Otherwise, add new shoe object to the array
                cartItems.push({ name, price, imgSrc, quantity: 1, size: 'UK 9' }); 
            }

            // Save the updated array back to localStorage
            localStorage.setItem('draftCart', JSON.stringify(cartItems));
            updateCartBadge();

            // Button visual feedback
            const originalText = button.innerText;
            button.innerText = "Added!";
            button.style.backgroundColor = "green";
            setTimeout(() => {
                button.innerText = originalText;
                button.style.backgroundColor = "black";
            }, 1000);
        });
    });

    // 4. Render Cart Logic (Used ONLY on cart.html)
    const cartTableBody = document.getElementById('cart-table-body');
    const cartSubtotal = document.getElementById('cart-subtotal');

    function renderCart() {
        // If we aren't on the cart page, stop running this function
        if(!cartTableBody) return; 

        cartTableBody.innerHTML = ''; // Clear the table completely
        let total = 0;

        if(cartItems.length === 0) {
            cartTableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 40px;">Your cart is empty. Time to step up your style!</td></tr>';
            if(cartSubtotal) cartSubtotal.innerText = 'R0.00';
            return;
        }

        // Loop through the saved items and build HTML rows
        cartItems.forEach((item, index) => {
            const row = document.createElement('tr');
            const itemTotal = item.price * item.quantity;
            total += itemTotal;

            row.innerHTML = `
                <td>
                    <img src="${item.imgSrc}" alt="${item.name}" style="width: 80px; border-radius: 5px; vertical-align: middle; margin-right: 15px;">
                    <strong>${item.name}</strong>
                </td>
                <td>${item.size}</td>
                <td>
                    <input type="number" min="1" value="${item.quantity}" class="qty-input" data-index="${index}" style="width: 60px; padding: 5px; border-radius: 5px; border: 1px solid #ddd;">
                </td>
                <td>R${itemTotal.toLocaleString('en-ZA', {minimumFractionDigits: 2})}</td>
                <td><button class="remove-btn" data-index="${index}" style="color: #ff3c00; background: none; border: none; font-weight: bold; cursor: pointer;">Remove</button></td>
            `;
            cartTableBody.appendChild(row);
        });

        if(cartSubtotal) {
            cartSubtotal.innerText = `R${total.toLocaleString('en-ZA', {minimumFractionDigits: 2})}`;
        }

        // 5. Action: Remove Item Button
        document.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = e.target.getAttribute('data-index');
                cartItems.splice(idx, 1); // Delete 1 item at this index
                localStorage.setItem('draftCart', JSON.stringify(cartItems)); // Save new array
                renderCart(); // Redraw table
                updateCartBadge(); // Update nav number
            });
        });

        // 6. Action: Change Quantity Input
        document.querySelectorAll('.qty-input').forEach(input => {
            input.addEventListener('change', (e) => {
                const idx = e.target.getAttribute('data-index');
                const newQty = parseInt(e.target.value);
                if(newQty > 0) {
                    cartItems[idx].quantity = newQty;
                    localStorage.setItem('draftCart', JSON.stringify(cartItems));
                    renderCart();
                    updateCartBadge();
                }
            });
        });
    }

    renderCart(); // Trigger the table render immediately

    // --- 3. INTERACTIVE LIGHTBOX GALLERY ---
    // (Keep your existing lightbox code here exactly as it was)
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const captionText = document.getElementById('caption');
    const galleryImages = document.querySelectorAll('.gallery-img');
    const closeBtn = document.querySelector('.close-lightbox');

    galleryImages.forEach(img => {
        img.addEventListener('click', function() {
            if(lightbox) {
                lightbox.style.display = "block";
                lightboxImg.src = this.src;
                captionText.innerHTML = this.alt; 
            }
        });
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            lightbox.style.display = "none";
        });
    }

    window.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            lightbox.style.display = "none";
        }
    });
});

// --- 4. FORM VALIDATION & AJAX (Part 4) ---
    
    // Function to check valid email format
    function isValidEmail(email) {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }

    // -- A. Contact Form Logic --
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault(); // Prevent page reload
            
            let isValid = true;
            
            // Validate Name
            const name = document.getElementById('contactName');
            const nameError = document.getElementById('nameError');
            if (name.value.trim().length < 2) {
                name.classList.add('input-error');
                nameError.style.display = 'block';
                isValid = false;
            } else {
                name.classList.remove('input-error');
                nameError.style.display = 'none';
            }

            // Validate Email
            const email = document.getElementById('contactEmail');
            const emailError = document.getElementById('emailError');
            if (!isValidEmail(email.value)) {
                email.classList.add('input-error');
                emailError.style.display = 'block';
                isValid = false;
            } else {
                email.classList.remove('input-error');
                emailError.style.display = 'none';
            }

            // Validate Message Type
            const type = document.getElementById('messageType');
            const typeError = document.getElementById('typeError');
            if (type.value === "") {
                type.classList.add('input-error');
                typeError.style.display = 'block';
                isValid = false;
            } else {
                type.classList.remove('input-error');
                typeError.style.display = 'none';
            }

            // Validate Message Length
            const msg = document.getElementById('contactMessage');
            const msgError = document.getElementById('msgError');
            if (msg.value.trim().length < 10) {
                msg.classList.add('input-error');
                msgError.style.display = 'block';
                isValid = false;
            } else {
                msg.classList.remove('input-error');
                msgError.style.display = 'none';
            }

            // AJAX Simulation
            if (isValid) {
                const btn = document.getElementById('contactSubmitBtn');
                btn.innerText = "Sending...";
                
                // Simulate network request delay (AJAX)
                setTimeout(() => {
                    contactForm.style.display = 'none'; // Hide form
                    const responseBox = document.getElementById('contactResponse');
                    responseBox.style.display = 'block';
                    responseBox.classList.add('response-success');
                    responseBox.innerHTML = `Thank you, ${name.value}! Your message has been compiled into an email and sent to the DraFT.sneakers team.`;
                }, 1500);
            }
        });
    }

    // -- B. Enquiry Form Logic --
    const enquiryForm = document.getElementById('enquiryForm');
    if (enquiryForm) {
        enquiryForm.addEventListener('submit', function(e) {
            e.preventDefault(); 
            
            let isValid = true;
            
            // Validate Name
            const name = document.getElementById('enqName');
            const nameError = document.getElementById('enqNameError');
            if (name.value.trim().length < 2) {
                name.classList.add('input-error');
                nameError.style.display = 'block';
                isValid = false;
            } else {
                name.classList.remove('input-error');
                nameError.style.display = 'none';
            }

            // Validate Phone (exactly 10 digits)
            const phone = document.getElementById('enqPhone');
            const phoneError = document.getElementById('enqPhoneError');
            const phoneRegex = /^[0-9]{10}$/;
            if (!phoneRegex.test(phone.value)) {
                phone.classList.add('input-error');
                phoneError.style.display = 'block';
                isValid = false;
            } else {
                phone.classList.remove('input-error');
                phoneError.style.display = 'none';
            }

            // Validate Type
            const type = document.getElementById('enqType');
            const typeError = document.getElementById('enqTypeError');
            if (type.value === "") {
                type.classList.add('input-error');
                typeError.style.display = 'block';
                isValid = false;
            } else {
                type.classList.remove('input-error');
                typeError.style.display = 'none';
            }

            // AJAX Simulation processing specific logic from rubric
            if (isValid) {
                const btn = document.getElementById('enqSubmitBtn');
                btn.innerText = "Processing...";
                
                setTimeout(() => {
                    enquiryForm.style.display = 'none'; 
                    const responseBox = document.getElementById('enquiryResponse');
                    responseBox.style.display = 'block';
                    responseBox.classList.add('response-success');
                    
                    // Dynamic response based on selection (Rubric requirement)
                    let responseMsg = "";
                    if (type.value === "product") {
                        responseMsg = `Hi ${name.value}, we will check our inventory and text availability and cost to ${phone.value} shortly.`;
                    } else if (type.value === "sponsor") {
                        responseMsg = `Thanks for your interest in sponsoring! Our team will call you at ${phone.value} with details.`;
                    } else {
                        responseMsg = `Enquiry received. We will contact you at ${phone.value} regarding our services.`;
                    }
                    
                    responseBox.innerHTML = responseMsg;
                }, 1500);
            }
        });
    }