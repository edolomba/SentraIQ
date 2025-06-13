document.addEventListener('DOMContentLoaded', () => {
    // --- Element Selectors ---
    const authPage = document.getElementById('auth-page');
    const loginSection = document.getElementById('login-section');
    const registerSection = document.getElementById('register-section');
    const showRegisterLink = document.getElementById('show-register');
    const showLoginLink = document.getElementById('show-login');
    const loginButton = document.getElementById('login-button');
    const registerButton = document.getElementById('register-button');
    const logoutButton = document.getElementById('logout-button');

    const loginEmailInput = document.getElementById('login-email');
    const loginPasswordInput = document.getElementById('login-password');
    const registerEmailInput = document.getElementById('register-email');
    const registerPasswordInput = document.getElementById('register-password');
    const registerPasswordConfirmInput = document.getElementById('register-password-confirm');
    const registerRoleSelect = document.getElementById('register-role'); // New: Role select

    const dashboardPage = document.getElementById('dashboard-page');
    const displayUserEmail = document.getElementById('display-user-email');
    const displayUserRole = document.getElementById('display-user-role');

    // Dashboard Sections
    const addOrderSection = document.getElementById('add-order-section');
    const activeShipmentsSection = document.getElementById('active-shipments-section');
    const transportersSection = document.getElementById('transporters-section');
    const notificationsSection = document.getElementById('notifications-section');
    const chatSection = document.getElementById('chat-section');
    const mapSection = document.getElementById('map-section'); // New: Map section

    const navItems = document.querySelectorAll('.bottom-nav .nav-item');

    // Add Order Form
    const addOrderForm = document.getElementById('add-order-form');
    const clientNameInput = document.getElementById('client-name');
    const deliveryAddressInput = document.getElementById('delivery-address');
    const productDescriptionInput = document.getElementById('product-description');
    const deliveryDateInput = document.getElementById('delivery-date');

    // Shipments List
    const shipmentsList = document.getElementById('shipments-list');
    const shipmentSearchInput = document.getElementById('shipment-search');
    const statusFilterSelect = document.getElementById('status-filter');

    // Chat
    const chatOrderTitle = document.getElementById('chat-order-title');
    const chatMessagesContainer = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const chatFileInput = document.getElementById('chat-file-input'); // New: File input
    const sendChatBtn = document.getElementById('send-chat-btn');
    const closeChatBtn = document.getElementById('close-chat-btn');

    // Mock Data for Shipments and Transporters (we'll replace this with Firestore later)
    let mockShipments = JSON.parse(localStorage.getItem('mockShipments')) || [
        { id: '1', client: 'Cliente A', address: 'Rua X, 123', product: 'Celular', date: '2025-06-15', status: 'pending', createdBy: 'venda@example.com', currentChatMessages: [{sender: 'System', text: 'Chat started for Pedido #001', time: '10:00'}] },
        { id: '2', client: 'Cliente B', address: 'Av. Y, 456', product: 'Geladeira', date: '2025-06-20', status: 'in-transit', createdBy: 'logistica@example.com', currentChatMessages: [{sender: 'System', text: 'Chat started for Pedido #002', time: '11:00'}] },
        { id: '3', client: 'Cliente C', address: 'Via Z, 789', product: 'TV', date: '2025-07-01', status: 'delivered', createdBy: 'venda@example.com', currentChatMessages: [{sender: 'System', text: 'Chat started for Pedido #003', time: '12:00'}] }
    ];
    let mockTransporters = JSON.parse(localStorage.getItem('mockTransporters')) || [
        { name: 'Transportadora A', contact: '(11) 9876-5432', rating: 4.5 },
        { name: 'Transportadora B', contact: '(21) 1234-5678', rating: 4.0 },
        { name: 'Transportadora C', contact: '(31) 5555-4444', rating: 3.8 }
    ];
    // This will store the currently logged-in user's role
    let currentUserRole = null;
    let currentUserId = null; // We'll simulate a user ID for chat
    let currentUserEmail = null;

    // --- Utility Functions ---

    // Function to show a specific section and hide others
    const showSection = (sectionElement) => {
        document.querySelectorAll('.dashboard-section').forEach(sec => sec.classList.remove('active'));
        sectionElement.classList.add('active');
    };

    // Update bottom navigation active state
    const updateNavActiveState = (targetId) => {
        navItems.forEach(item => {
            if (item.dataset.target === targetId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    };

    // --- Authentication & User State Management (Mock) ---

    // Function to update UI based on user's role
    const updateUIVisibility = () => {
        // Hide all potentially role-restricted elements first
        addOrderSection.classList.add('hidden');
        // Example: Specific buttons, or entire sections. Add more as needed.

        // Show elements based on currentUserRole
        if (currentUserRole) {
            // All roles can see active shipments, transporters, notifications, map
            activeShipmentsSection.classList.remove('hidden');
            transportersSection.classList.remove('hidden');
            notificationsSection.classList.remove('hidden');
            mapSection.classList.remove('hidden');

            switch (currentUserRole) {
                case 'venda':
                    addOrderSection.classList.remove('hidden'); // Venda can add orders
                    break;
                case 'logistica':
                    // Logistica has broader access to shipments (e.g., update status)
                    // (Actual button visibility/enabling would be handled during shipment rendering)
                    break;
                case 'financeiro':
                    // Financeiro might have specific reports section (not yet implemented)
                    break;
                case 'admin':
                    addOrderSection.classList.remove('hidden'); // Admin can add orders
                    // Admin sees everything
                    break;
                default:
                    // Fallback for unknown roles
                    break;
            }
        }
        // Ensure only one dashboard section is active on load or login
        showSection(activeShipmentsSection); // Default view after login
        updateNavActiveState('active-shipments-section');
    };


    const checkAuthStatus = () => {
        const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
        if (loggedInUser && loggedInUser.email && loggedInUser.role) {
            currentUserEmail = loggedInUser.email;
            currentUserRole = loggedInUser.role;
            // Simulate a user ID based on email for chat purposes
            currentUserId = loggedInUser.email.split('@')[0];

            displayUserEmail.textContent = currentUserEmail;
            displayUserRole.textContent = currentUserRole.charAt(0).toUpperCase() + currentUserRole.slice(1); // Capitalize first letter

            authPage.classList.remove('active');
            dashboardPage.classList.add('active');
            updateUIVisibility(); // Adjust UI based on role
            renderShipments(); // Render shipments for the current user
            renderTransporters(); // Render transporters
            renderNotifications(); // Render notifications
        } else {
            authPage.classList.add('active');
            dashboardPage.classList.remove('active');
            showLoginSection(); // Ensure login is shown if not logged in
        }
    };

    const showLoginSection = () => {
        loginSection.classList.add('active');
        registerSection.classList.remove('active');
    };

    const showRegisterSection = () => {
        loginSection.classList.remove('active');
        registerSection.classList.add('active');
    };

    const handleLogin = (e) => {
        e.preventDefault();
        const email = loginEmailInput.value;
        const password = loginPasswordInput.value;

        // Mocking user check: check if user exists in mock storage
        const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers')) || {};
        if (registeredUsers[email] && registeredUsers[email].password === password) {
            localStorage.setItem('loggedInUser', JSON.stringify({ email: email, role: registeredUsers[email].role }));
            alert('Login successful!');
            checkAuthStatus(); // Re-check status to navigate to dashboard
        } else {
            alert('Invalid credentials or user not registered.');
        }
    };

    const handleRegister = (e) => {
        e.preventDefault();
        const email = registerEmailInput.value;
        const password = registerPasswordInput.value;
        const confirmPassword = registerPasswordConfirmInput.value;
        const role = registerRoleSelect.value;

        if (!email || !password || !confirmPassword || !role) {
            alert('Please fill all fields, including role.');
            return;
        }

        if (password !== confirmPassword) {
            alert('Passwords do not match.');
            return;
        }

        // Mocking user registration: save to localStorage
        let registeredUsers = JSON.parse(localStorage.getItem('registeredUsers')) || {};
        if (registeredUsers[email]) {
            alert('User with this email already exists!');
            return;
        }

        registeredUsers[email] = { password: password, role: role };
        localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
        alert('Registration successful! Please login.');
        showLoginSection();
        registerEmailInput.value = '';
        registerPasswordInput.value = '';
        registerPasswordConfirmInput.value = '';
        registerRoleSelect.value = '';
    };

    const handleLogout = () => {
        localStorage.removeItem('loggedInUser');
        currentUserEmail = null;
        currentUserRole = null;
        currentUserId = null;
        alert('Logged out.');
        checkAuthStatus(); // Re-check status to navigate back to login
    };

    // --- Shipment Management (Mock) ---

    const renderShipments = () => {
        shipmentsList.innerHTML = ''; // Clear current list
        let filteredShipments = mockShipments;

        // Apply search filter
        const searchTerm = shipmentSearchInput.value.toLowerCase();
        if (searchTerm) {
            filteredShipments = filteredShipments.filter(shipment =>
                shipment.client.toLowerCase().includes(searchTerm) ||
                shipment.product.toLowerCase().includes(searchTerm) ||
                shipment.address.toLowerCase().includes(searchTerm)
            );
        }

        // Apply status filter
        const statusFilter = statusFilterSelect.value;
        if (statusFilter !== 'all') {
            filteredShipments = filteredShipments.filter(shipment => shipment.status === statusFilter);
        }

        // Apply role-based filtering (NEW!)
        if (currentUserRole && currentUserRole !== 'admin') {
            filteredShipments = filteredShipments.filter(shipment => {
                if (currentUserRole === 'venda') {
                    // Venda sees only their own created shipments
                    return shipment.createdBy === currentUserEmail;
                }
                // For logistica, financeiro, they might see all within their company,
                // but for this mock, we'll assume 'logistica' and 'financeiro' see all shipments.
                // In a real app, this would be based on companyId.
                return true;
            });
        }


        if (filteredShipments.length === 0) {
            shipmentsList.innerHTML = '<p>Nenhum envio encontrado para os filtros aplicados.</p>';
            return;
        }

        filteredShipments.forEach(shipment => {
            const shipmentCard = document.createElement('div');
            shipmentCard.classList.add('shipment-card');
            shipmentCard.dataset.id = shipment.id;

            let updateButtonHtml = '';
            // Only Logistica and Admin can update status in this mock
            if (currentUserRole === 'logistica' || currentUserRole === 'admin') {
                 updateButtonHtml = `<button class="btn-secondary update-status-btn" data-current-status="${shipment.status}">Atualizar Status</button>`;
            }


            shipmentCard.innerHTML = `
                <div class="card-header">
                    <h3>Pedido #${shipment.id} - ${shipment.client}</h3>
                    <span class="status ${shipment.status}">${shipment.status.charAt(0).toUpperCase() + shipment.status.slice(1).replace('-', ' ')}</span>
                </div>
                <p>Endereço: ${shipment.address}</p>
                <p>Produto: ${shipment.product}</p>
                <p>Entrega: ${shipment.date}</p>
                <p>Responsável: ${shipment.createdBy}</p>
                <div class="card-actions">
                    ${updateButtonHtml}
                    <button class="btn-secondary view-chat-btn" data-id="${shipment.id}">Ver Chat</button>
                </div>
            `;
            shipmentsList.appendChild(shipmentCard);
        });

        // Add event listeners to newly rendered buttons
        document.querySelectorAll('.update-status-btn').forEach(button => {
            button.onclick = (e) => handleUpdateStatus(e.target);
        });
        document.querySelectorAll('.view-chat-btn').forEach(button => {
            button.onclick = (e) => openChat(e.target.dataset.id);
        });
    };

    const handleAddOrder = (e) => {
        e.preventDefault();
        const clientName = clientNameInput.value;
        const deliveryAddress = deliveryAddressInput.value;
        const productDescription = productDescriptionInput.value;
        const deliveryDate = deliveryDateInput.value;

        if (!clientName || !deliveryAddress || !productDescription || !deliveryDate) {
            alert('Por favor, preencha todos os campos do pedido.');
            return;
        }

        const newOrderId = (mockShipments.length + 1).toString();
        const newOrder = {
            id: newOrderId,
            client: clientName,
            address: deliveryAddress,
            product: productDescription,
            date: deliveryDate,
            status: 'pending', // Default status for new orders
            createdBy: currentUserEmail, // Track who created the order
            currentChatMessages: [{sender: 'System', text: `Chat started for Pedido #${newOrderId}`, time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}]
        };

        mockShipments.push(newOrder);
        localStorage.setItem('mockShipments', JSON.stringify(mockShipments)); // Save to mock storage
        alert('Novo pedido adicionado com sucesso!');
        addOrderForm.reset(); // Clear the form
        renderShipments(); // Re-render shipments to show the new one
        showSection(activeShipmentsSection); // Go back to shipments list
        updateNavActiveState('active-shipments-section');
    };

    const handleUpdateStatus = (button) => {
        const shipmentCard = button.closest('.shipment-card');
        const shipmentId = shipmentCard.dataset.id;
        const currentStatus = button.dataset.currentStatus;

        const statusOptions = ['pending', 'in-transit', 'delivered', 'cancelled'];
        const currentIndex = statusOptions.indexOf(currentStatus);
        const nextStatus = statusOptions[(currentIndex + 1) % statusOptions.length]; // Cycle through statuses

        // In a real app, this would involve more complex state transitions and permissions
        if (confirm(`Deseja mudar o status do Pedido #${shipmentId} de "${currentStatus}" para "${nextStatus}"?`)) {
            const shipmentIndex = mockShipments.findIndex(s => s.id === shipmentId);
            if (shipmentIndex !== -1) {
                mockShipments[shipmentIndex].status = nextStatus;
                // Add a mock chat message about the status update
                mockShipments[shipmentIndex].currentChatMessages.push({
                    sender: 'System',
                    text: `Status updated to "${nextStatus.charAt(0).toUpperCase() + nextStatus.slice(1).replace('-', ' ')}" by ${currentUserRole}.`,
                    time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                });

                localStorage.setItem('mockShipments', JSON.stringify(mockShipments));
                renderShipments(); // Re-render to reflect changes
                alert(`Status do Pedido #${shipmentId} atualizado para ${nextStatus}!`);
            }
        }
    };

    // --- Transporter Management (Mock) ---
    const renderTransporters = () => {
        const transportersList = document.getElementById('transporters-list');
        transportersList.innerHTML = '';

        let filteredTransporters = mockTransporters;

        // Apply search filter (mock)
        const searchTerm = document.getElementById('transporter-search').value.toLowerCase();
        if (searchTerm) {
            filteredTransporters = filteredTransporters.filter(transporter =>
                transporter.name.toLowerCase().includes(searchTerm) ||
                transporter.contact.toLowerCase().includes(searchTerm)
            );
        }

        // Apply rating filter (mock)
        const ratingFilter = parseFloat(document.getElementById('rating-filter').value);
        if (!isNaN(ratingFilter) && ratingFilter !== 'all') {
            filteredTransporters = filteredTransporters.filter(transporter =>
                Math.floor(transporter.rating) === ratingFilter
            );
        }

        if (filteredTransporters.length === 0) {
            transportersList.innerHTML = '<p>Nenhuma transportadora encontrada para os filtros aplicados.</p>';
            return;
        }

        filteredTransporters.forEach(transporter => {
            const transporterCard = document.createElement('div');
            transporterCard.classList.add('transporter-card');
            const fullStars = Math.floor(transporter.rating);
            const hasHalfStar = transporter.rating % 1 !== 0;
            const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

            let starsHtml = '';
            for (let i = 0; i < fullStars; i++) starsHtml += '<i class="fas fa-star"></i>';
            if (hasHalfStar) starsHtml += '<i class="fas fa-star-half-alt"></i>';
            for (let i = 0; i < emptyStars; i++) starsHtml += '<i class="far fa-star"></i>';

            transporterCard.innerHTML = `
                <h3>${transporter.name}</h3>
                <p>Contato: ${transporter.contact}</p>
                <div class="rating">
                    ${starsHtml} (${transporter.rating.toFixed(1)})
                </div>
            `;
            transportersList.appendChild(transporterCard);
        });
    };

    // --- Notifications Management (Mock) ---
    const renderNotifications = () => {
        const notificationsList = document.getElementById('notifications-list');
        notificationsList.innerHTML = '';
        // Mock notifications - these would come from a database in a real app
        const mockNotifications = [
            { id: 1, text: 'Pedido #001 - Status atualizado para "Em Trânsito".', time: '10 min atrás', read: true },
            { id: 2, text: 'Novo pedido #003 adicionado por Vendedor Z.', time: '2 horas atrás', read: false },
            { id: 3, text: 'Você tem uma nova mensagem no chat do Pedido #002.', time: '30 min atrás', read: false, roles: ['logistica', 'venda', 'admin'] } // Example of role-specific mock notification
        ];

        let filteredNotifications = mockNotifications;

        // Filter notifications based on role (mock logic)
        if (currentUserRole && currentUserRole !== 'admin') {
             filteredNotifications = mockNotifications.filter(notif => {
                // If a notification has 'roles' property, only show to those roles
                if (notif.roles && !notif.roles.includes(currentUserRole)) {
                    return false;
                }
                return true;
            });
        }


        if (filteredNotifications.length === 0) {
            notificationsList.innerHTML = '<p>Nenhuma notificação.</p>';
            return;
        }

        filteredNotifications.forEach(notification => {
            const notificationCard = document.createElement('div');
            notificationCard.classList.add('notification-card', notification.read ? 'read' : 'unread');
            notificationCard.innerHTML = `
                <p>${notification.text}</p>
                <span>${notification.time}</span>
            `;
            notificationsList.appendChild(notificationCard);
        });
    };


    // --- Chat Management (Mock with File Attachment Simulation) ---
    let activeChatShipmentId = null;

    const openChat = (shipmentId) => {
        activeChatShipmentId = shipmentId;
        const shipment = mockShipments.find(s => s.id === shipmentId);
        if (shipment) {
            chatOrderTitle.textContent = `Chat do Pedido #${shipment.id} - ${shipment.client}`;
            renderChatMessages(shipment.currentChatMessages || []);
            chatSection.classList.add('active'); // Show chat overlay
        }
    };

    const closeChat = () => {
        chatSection.classList.remove('active'); // Hide chat overlay
        activeChatShipmentId = null;
        chatMessagesContainer.innerHTML = ''; // Clear messages
    };

    const renderChatMessages = (messages) => {
        chatMessagesContainer.innerHTML = '';
        messages.forEach(msg => {
            const messageDiv = document.createElement('div');
            // Mock sender, real app would check if sender.uid === currentUser.uid
            const isSentByMe = msg.sender === `Você (${currentUserRole})`; // Simple mock check
            messageDiv.classList.add('chat-message', isSentByMe ? 'sent' : 'received');

            let messageContent = `<span class="message-sender">${isSentByMe ? 'Você' : msg.sender}</span>`;
            if (msg.text) {
                messageContent += `<p>${msg.text}</p>`;
            }
            if (msg.fileUrl && msg.fileName && msg.fileType) {
                if (msg.fileType.startsWith('image')) {
                    messageContent += `
                        <a href="${msg.fileUrl}" class="chat-attachment" target="_blank">
                            <img src="${msg.fileUrl}" alt="Anexo">
                            <span>${msg.fileName}</span>
                        </a>`;
                } else {
                    messageContent += `
                        <a href="${msg.fileUrl}" class="chat-attachment" target="_blank">
                            <i class="fas fa-file"></i>
                            <span>${msg.fileName}</span>
                        </a>`;
                }
            }
            messageContent += `<span class="message-time">${msg.time}</span>`;
            messageDiv.innerHTML = messageContent;
            chatMessagesContainer.appendChild(messageDiv);
        });
        chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight; // Scroll to bottom
    };

    const handleSendMessage = () => {
        const messageText = chatInput.value.trim();
        const selectedFile = chatFileInput.files[0]; // Get the selected file

        if (!messageText && !selectedFile) {
            alert('Por favor, digite uma mensagem ou selecione um arquivo para enviar.');
            return;
        }

        if (!activeChatShipmentId) {
            alert('Selecione um pedido para conversar.');
            return;
        }

        const shipmentIndex = mockShipments.findIndex(s => s.id === activeChatShipmentId);
        if (shipmentIndex === -1) return;

        const newMessage = {
            sender: `Você (${currentUserRole})`, // Mock sender
            time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        };

        if (messageText) {
            newMessage.text = messageText;
        }

        // --- Mocking File Upload ---
        if (selectedFile) {
            // In a real app, you'd upload this file to Firebase Storage
            // For now, we'll create a mock URL and file info
            newMessage.fileUrl = URL.createObjectURL(selectedFile); // Create a temporary URL
            newMessage.fileName = selectedFile.name;
            newMessage.fileType = selectedFile.type;
            console.log(`Mock file uploaded: ${selectedFile.name} (${selectedFile.type})`);
        }

        mockShipments[shipmentIndex].currentChatMessages.push(newMessage);
        localStorage.setItem('mockShipments', JSON.stringify(mockShipments)); // Update mock storage

        renderChatMessages(mockShipments[shipmentIndex].currentChatMessages);
        chatInput.value = ''; // Clear text input
        chatFileInput.value = ''; // Clear file input
    };


    // --- Event Listeners ---

    // Auth page navigation
    showRegisterLink.addEventListener('click', showRegisterSection);
    showLoginLink.addEventListener('click', showLoginSection);
    loginButton.addEventListener('click', handleLogin);
    registerButton.addEventListener('click', handleRegister);
    logoutButton.addEventListener('click', handleLogout);

    // Dashboard navigation
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetId = item.dataset.target;
            showSection(document.getElementById(targetId));
            updateNavActiveState(targetId);

            // Re-render certain sections when navigating to them to ensure filters are applied
            if (targetId === 'active-shipments-section') renderShipments();
            if (targetId === 'transporters-section') renderTransporters();
            if (targetId === 'notifications-section') renderNotifications();
        });
    });

    // Add Order Form
    addOrderForm.addEventListener('submit', handleAddOrder);

    // Shipments Search and Filter
    shipmentSearchInput.addEventListener('input', renderShipments);
    statusFilterSelect.addEventListener('change', renderShipments);

    // Transporter Search and Filter
    document.getElementById('transporter-search').addEventListener('input', renderTransporters);
    document.getElementById('rating-filter').addEventListener('change', renderTransporters);

    // Chat events
    sendChatBtn.addEventListener('click', handleSendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    });
    closeChatBtn.addEventListener('click', closeChat);

    // Mock map controls
    document.getElementById('update-location-btn').addEventListener('click', () => {
        const selectedOrder = document.getElementById('select-order-for-map').value;
        if (selectedOrder) {
            alert(`Simulando atualização de localização para Pedido #${selectedOrder}. (Isso envolveria API de mapas e dados reais em um ambiente real.)`);
        } else {
            alert('Por favor, selecione um pedido para atualizar a localização.');
        }
    });


    // --- Initial Load ---
    checkAuthStatus(); // Check if user is already logged in on page load
    renderShipments(); // Initial render of shipments (will be filtered by role)
    renderTransporters(); // Initial render of transporters
    renderNotifications(); // Initial render of notifications
});
