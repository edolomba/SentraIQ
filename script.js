document.addEventListener('DOMContentLoaded', () => {
    // --- Seletores de Elementos ---
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
    const registerRoleSelect = document.getElementById('register-role');

    const dashboardPage = document.getElementById('dashboard-page');
    const displayUserEmail = document.getElementById('display-user-email');
    const displayUserRole = document.getElementById('display-user-role');

    // Seções do Dashboard
    const addOrderSection = document.getElementById('add-order-section');
    const activeShipmentsSection = document.getElementById('active-shipments-section');
    const transportersSection = document.getElementById('transporters-section');
    const notificationsSection = document.getElementById('notifications-section');
    const chatSection = document.getElementById('chat-section');
    const mapSection = document.getElementById('map-section'); // Assicurati che esista in HTML

    const navItems = document.querySelectorAll('.bottom-nav .nav-item');

    // Formulário Adicionar Pedido (Novos Campos)
    const addOrderForm = document.getElementById('add-order-form');
    const clientNameInput = document.getElementById('client-name');
    const productDescriptionInput = document.getElementById('product-description');
    const freightValueInput = document.getElementById('freight-value'); // Novo
    const orderValueInput = document.getElementById('order-value');     // Novo
    const departureAddressInput = document.getElementById('departure-address'); // Novo
    const deliveryAddressInput = document.getElementById('delivery-address');   // Novo
    const deliveryDateInput = document.getElementById('delivery-date');
    const freightPercentageSpan = document.getElementById('freight-percentage'); // Novo

    // Lista de Envios
    const shipmentsList = document.getElementById('shipments-list');
    const shipmentSearchInput = document.getElementById('shipment-search');
    const statusFilterSelect = document.getElementById('status-filter');

    // Chat
    const chatOrderTitle = document.getElementById('chat-order-title');
    const chatMessagesContainer = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const chatFileInput = document.getElementById('chat-file-input');
    const sendChatBtn = document.getElementById('send-chat-btn');
    const closeChatBtn = document.getElementById('close-chat-btn'); // Ora funzionerà

    // Dados Mock (simulados) para Envios e Transportadoras
    let mockShipments = JSON.parse(localStorage.getItem('mockShipments')) || [
        { id: '1', client: 'Cliente A', product: 'Celular', freightValue: 10.00, orderValue: 200.00, departureAddress: 'Rua Alfa, 100', deliveryAddress: 'Rua X, 123', date: '2025-06-15', status: 'pending', createdBy: 'venda@example.com', currentChatMessages: [{sender: 'Sistema', text: 'Chat iniciado para Pedido #001', time: '10:00'}] },
        { id: '2', client: 'Cliente B', product: 'Geladeira', freightValue: 50.00, orderValue: 1500.00, departureAddress: 'Av. Beta, 200', deliveryAddress: 'Av. Y, 456', date: '2025-06-20', status: 'in-transit', createdBy: 'logistica@example.com', currentChatMessages: [{sender: 'Sistema', text: 'Chat iniciado para Pedido #002', time: '11:00'}] },
        { id: '3', client: 'Cliente C', product: 'TV', freightValue: 30.00, orderValue: 1000.00, departureAddress: 'Praça Gama, 300', deliveryAddress: 'Via Z, 789', date: '2025-07-01', status: 'delivered', createdBy: 'venda@example.com', currentChatMessages: [{sender: 'Sistema', text: 'Chat iniciado para Pedido #003', time: '12:00'}] }
    ];
    let mockTransporters = JSON.parse(localStorage.getItem('mockTransporters')) || [
        { name: 'Transportadora A', contact: '(11) 9876-5432', rating: 4.5 },
        { name: 'Transportadora B', contact: '(21) 1234-5678', rating: 4.0 },
        { name: 'Transportadora C', contact: '(31) 5555-4444', rating: 3.8 }
    ];
    
    // Variáveis para o usuário logado
    let currentUserRole = null;
    let currentUserId = null;
    let currentUserEmail = null;

    // --- Funções de Utilitário ---

    // Função para mostrar uma seção específica e ocultar as outras
    const showSection = (sectionElement) => {
        document.querySelectorAll('.dashboard-section').forEach(sec => sec.classList.remove('active'));
        if (sectionElement) {
            sectionElement.classList.add('active');
            console.log(`Mostrando seção: ${sectionElement.id}`); // Debugging
        }
    };

    // Atualiza o estado ativo da navegação inferior
    const updateNavActiveState = (targetId) => {
        navItems.forEach(item => {
            if (item.dataset.target === targetId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    };

    // --- Gerenciamento de Autenticação e Estado do Usuário (Mock) ---

    // Função para atualizar a UI com base no papel do usuário
    const updateUIVisibility = () => {
        // Oculta todas as seções por padrão
        document.querySelectorAll('.dashboard-section').forEach(sec => sec.classList.add('hidden'));

        // Mostra elementos com base no currentUserRole
        if (currentUserRole) {
            switch (currentUserRole) {
                case 'venda':
                    addOrderSection.classList.remove('hidden');
                    activeShipmentsSection.classList.remove('hidden');
                    transportersSection.classList.remove('hidden');
                    notificationsSection.classList.remove('hidden');
                    break;
                case 'logistica':
                    activeShipmentsSection.classList.remove('hidden');
                    transportersSection.classList.remove('hidden');
                    notificationsSection.classList.remove('hidden');
                    mapSection.classList.remove('hidden');
                    break;
                case 'financeiro':
                    notificationsSection.classList.remove('hidden');
                    transportersSection.classList.remove('hidden');
                    activeShipmentsSection.classList.remove('hidden'); // Financeiro também vê envios para NF
                    break;
                case 'admin':
                    addOrderSection.classList.remove('hidden');
                    activeShipmentsSection.classList.remove('hidden');
                    transportersSection.classList.remove('hidden');
                    notificationsSection.classList.remove('hidden');
                    mapSection.classList.remove('hidden');
                    break;
                default:
                    break;
            }
        }
        // Garante que uma seção ativa seja mostrada, geralmente a de envios
        showSection(activeShipmentsSection); // Visão padrão após o login
        updateNavActiveState('active-shipments-section');
    };

    const checkAuthStatus = () => {
        const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
        console.log('checkAuthStatus chamada. loggedInUser:', loggedInUser);

        if (loggedInUser && loggedInUser.email && loggedInUser.role) {
            currentUserEmail = loggedInUser.email;
            currentUserRole = loggedInUser.role;
            currentUserId = loggedInUser.email.split('@')[0];

            displayUserEmail.textContent = currentUserEmail;
            displayUserRole.textContent = currentUserRole.charAt(0).toUpperCase() + currentUserRole.slice(1);

            authPage.classList.remove('active');
            dashboardPage.classList.add('active');

            console.log('Utente loggato. Classi aggiornate: auth-page.active = false, dashboard-page.active = true');
            
            updateUIVisibility();
            renderShipments();
            renderTransporters();
            renderNotifications();
        } else {
            authPage.classList.add('active');
            dashboardPage.classList.remove('active');
            showLoginSection();
            console.log('Nessun utente loggato. Mostrando pagina di autenticazione.');
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

        const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers')) || {};
        if (registeredUsers[email] && registeredUsers[email].password === password) {
            localStorage.setItem('loggedInUser', JSON.stringify({ email: email, role: registeredUsers[email].role }));
            alert('Login realizado com sucesso!');
            console.log('Login bem-sucedido. Chamando checkAuthStatus.');
            checkAuthStatus();
        } else {
            alert('Credenciais inválidas ou usuário não cadastrado.');
            console.log('Login falhou.');
        }
    };

    const handleRegister = (e) => {
        e.preventDefault();
        const email = registerEmailInput.value;
        const password = registerPasswordInput.value;
        const confirmPassword = registerPasswordConfirmInput.value;
        const role = registerRoleSelect.value;

        if (!email || !password || !confirmPassword) {
            alert('Por favor, preencha todos os campos.');
            return;
        }
        if (!role) {
             alert('Por favor, selecione seu papel (Vendas, Logística, Financeiro, Administrador).');
             return;
        }

        if (password !== confirmPassword) {
            alert('As senhas não coincidem.');
            return;
        }

        let registeredUsers = JSON.parse(localStorage.getItem('registeredUsers')) || {};
        if (registeredUsers[email]) {
            alert('Já existe um usuário com este email!');
            return;
        }

        registeredUsers[email] = { password: password, role: role };
        localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
        alert('Cadastro realizado com sucesso! Por favor, faça o login.');
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
        alert('Você saiu da conta.');
        console.log('Usuário saiu. Chamando checkAuthStatus.');
        checkAuthStatus();
    };

    // --- Gerenciamento de Envios (Mock) ---

    // Definizione degli stati possibili per un ordine
    // Ogni stato ha un ruolo che può definirlo e un ruolo che può cambiarlo
    const orderStatuses = {
        'pending': { label: 'Pendente', allowedRolesToSet: ['venda', 'admin'], nextStates: ['venda_concluida', 'cancelled'] },
        'venda_concluida': { label: 'Venda Concluída', allowedRolesToSet: ['venda', 'admin'], nextStates: ['nota_fiscal_emitida', 'cancelled'] },
        'nota_fiscal_emitida': { label: 'Nota Fiscal Emitida', allowedRolesToSet: ['financeiro', 'admin'], nextStates: ['coletado', 'cancelled'] },
        'coletado': { label: 'Coletado', allowedRolesToSet: ['logistica', 'admin'], nextStates: ['em_transito', 'cancelled'] },
        'em_transito': { label: 'Em Trânsito', allowedRolesToSet: ['logistica', 'admin'], nextStates: ['em_rota_entrega', 'cancelled'] },
        'em_rota_entrega': { label: 'Em Rota de Entrega', allowedRolesToSet: ['logistica', 'admin'], nextStates: ['retirado_cliente', 'cancelled'] },
        'retirado_cliente': { label: 'Retirado pelo Cliente', allowedRolesToSet: ['logistica', 'admin'], nextStates: [] }, // Final State
        'cancelled': { label: 'Cancelado', allowedRolesToSet: ['venda', 'financeiro', 'logistica', 'admin'], nextStates: [] } // Final State
    };

    const renderShipments = () => {
        shipmentsList.innerHTML = '';
        let filteredShipments = mockShipments;

        const searchTerm = shipmentSearchInput.value.toLowerCase();
        if (searchTerm) {
            filteredShipments = filteredShipments.filter(shipment =>
                shipment.client.toLowerCase().includes(searchTerm) ||
                shipment.product.toLowerCase().includes(searchTerm) ||
                shipment.departureAddress.toLowerCase().includes(searchTerm) || // Aggiunto
                shipment.deliveryAddress.toLowerCase().includes(searchTerm)    // Aggiunto
            );
        }

        const statusFilter = statusFilterSelect.value;
        if (statusFilter !== 'all') {
            filteredShipments = filteredShipments.filter(shipment => shipment.status === statusFilter);
        }

        // Filtra per ruolo se non è admin
        if (currentUserRole && currentUserRole !== 'admin') {
            filteredShipments = filteredShipments.filter(shipment => {
                if (currentUserRole === 'venda') {
                    return shipment.createdBy === currentUserEmail;
                }
                // Tutti gli altri ruoli (logistica, financeiro) possono vedere tutti gli shipments
                // purché non siano stati creati da loro stessi (se applicabile, o rimuovere questa parte se devono vedere tutti)
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

            const currentStatusLabel = orderStatuses[shipment.status] ? orderStatuses[shipment.status].label : shipment.status;
            const freightPercentage = (shipment.freightValue / shipment.orderValue * 100).toFixed(2);
            const freightColor = parseFloat(freightPercentage) <= 4 ? 'green' : 'red';

            let updateButtonHtml = '';
            // Permetti di aggiornare lo stato solo se l'utente corrente ha il permesso di settare lo stato attuale
            if (orderStatuses[shipment.status] && orderStatuses[shipment.status].allowedRolesToSet.includes(currentUserRole) || currentUserRole === 'admin') {
                // Genera le opzioni per il prossimo stato consentito
                const nextAllowedStates = orderStatuses[shipment.status].nextStates;
                if (nextAllowedStates.length > 0) {
                    let optionsHtml = nextAllowedStates.map(stateKey => 
                        `<option value="${stateKey}">${orderStatuses[stateKey].label}</option>`
                    ).join('');
                    updateButtonHtml = `
                        <select class="status-selector" data-shipment-id="${shipment.id}" data-current-status="${shipment.status}">
                            <option value="">Mudar Status</option>
                            ${optionsHtml}
                        </select>
                    `;
                }
            }


            shipmentCard.innerHTML = `
                <div class="card-header">
                    <h3>Pedido #${shipment.id} - ${shipment.client}</h3>
                    <span class="status ${shipment.status}">${currentStatusLabel}</span>
                </div>
                <p>Produto: ${shipment.product}</p>
                <p>De: ${shipment.departureAddress}</p>
                <p>Para: ${shipment.deliveryAddress}</p>
                <p>Entrega: ${shipment.date}</p>
                <p>Valor Frete: R$ ${shipment.freightValue.toFixed(2)} / Pedido: R$ ${shipment.orderValue.toFixed(2)}</p>
                <p>Percentual Frete: <span style="color: ${freightColor};">${freightPercentage}%</span></p>
                <p>Responsável: ${shipment.createdBy}</p>
                <div class="card-actions">
                    ${updateButtonHtml}
                    <button class="btn-secondary view-chat-btn" data-id="${shipment.id}" data-client-name="${shipment.client}">Ver Chat</button>
                </div>
            `;
            shipmentsList.appendChild(shipmentCard);
        });

        document.querySelectorAll('.status-selector').forEach(select => {
            select.onchange = (e) => handleUpdateStatus(e.target);
        });
        document.querySelectorAll('.view-chat-btn').forEach(button => {
            button.onclick = (e) => openChat(e.target.dataset.id, e.target.dataset.clientName);
        });
    };

    // Calcola e visualizza la percentuale del frete
    const calculateFreightPercentage = () => {
        const freightValue = parseFloat(freightValueInput.value);
        const orderValue = parseFloat(orderValueInput.value);

        if (!isNaN(freightValue) && !isNaN(orderValue) && orderValue > 0) {
            const percentage = (freightValue / orderValue) * 100;
            freightPercentageSpan.textContent = `${percentage.toFixed(2)}%`;
            if (percentage > 4) {
                freightPercentageSpan.style.color = 'red';
                freightPercentageSpan.style.fontWeight = 'bold';
            } else {
                freightPercentageSpan.style.color = 'green';
                freightPercentageSpan.style.fontWeight = 'bold';
            }
        } else {
            freightPercentageSpan.textContent = '--';
            freightPercentageSpan.style.color = '#888';
        }
    };

    const handleAddOrder = async (e) => { // Made async for future distance calculation
        e.preventDefault();
        const clientName = clientNameInput.value;
        const productDescription = productDescriptionInput.value;
        const freightValue = parseFloat(freightValueInput.value);
        const orderValue = parseFloat(orderValueInput.value);
        const departureAddress = departureAddressInput.value;
        const deliveryAddress = deliveryAddressInput.value;
        const deliveryDate = deliveryDateInput.value;

        if (!clientName || !productDescription || isNaN(freightValue) || isNaN(orderValue) || !departureAddress || !deliveryAddress || !deliveryDate) {
            alert('Por favor, preencha todos os campos do pedido.');
            return;
        }

        if (orderValue <= 0) {
            alert('O valor total do pedido deve ser maior que zero.');
            return;
        }

        const percentage = (freightValue / orderValue) * 100;
        if (percentage > 4) {
            alert('A percentual do frete excede 4% do valor do pedido. Pedido não pode ser adicionado. A Logística precisa revisar.');
            // In un'applicazione reale, qui invieresti una notifica alla logistica.
            renderNotifications(); // Aggiorna le notifiche per potenzialmente mostrare un avviso per la logistica
            return;
        }

        // --- DISTANCE CALCULATION PLACEHOLDER ---
        // In un'implementazione reale, qui useresti un'API di mappe
        // Per ora, simuleremo un controllo di distanza "impossibile"
        const isDistanceFeasible = true; // Sostituire con logica API di mappe
        if (!isDistanceFeasible) {
            alert('O prazo de entrega é irreal para a distância. Pedido bloqueado, Logística será notificada.');
            // Invia notifica alla logistica
            renderNotifications();
            return;
        }


        const newOrderId = (mockShipments.length > 0 ? Math.max(...mockShipments.map(s => parseInt(s.id))) + 1 : 1).toString();
        
        const newOrder = {
            id: newOrderId,
            client: clientName,
            product: productDescription,
            freightValue: freightValue,
            orderValue: orderValue,
            departureAddress: departureAddress,
            deliveryAddress: deliveryAddress,
            date: deliveryDate,
            status: 'pending', // Inicia sempre como 'pending'
            createdBy: currentUserEmail,
            currentChatMessages: [{sender: 'Sistema', text: `Chat iniciado para Pedido #${newOrderId}`, time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}]
        };

        mockShipments.push(newOrder);
        localStorage.setItem('mockShipments', JSON.stringify(mockShipments));
        alert('Novo pedido adicionado com sucesso!');
        addOrderForm.reset();
        calculateFreightPercentage(); // Reset display
        renderShipments();
        showSection(activeShipmentsSection);
        updateNavActiveState('active-shipments-section');
    };

    const handleUpdateStatus = (selectElement) => {
        const shipmentId = selectElement.dataset.shipmentId;
        const newStatus = selectElement.value; // Il nuovo stato selezionato
        const currentStatus = selectElement.dataset.currentStatus; // Lo stato attuale dell'ordine

        if (!newStatus) { // Se l'utente seleziona "Mudar Status" (l'opzione vuota)
            return;
        }

        const shipmentIndex = mockShipments.findIndex(s => s.id === shipmentId);
        if (shipmentIndex === -1) return;

        // Verifica se l'utente ha il permesso di cambiare allo stato selezionato
        const allowedToSetNewStatus = orderStatuses[newStatus] && orderStatuses[newStatus].allowedRolesToSet.includes(currentUserRole);

        if (!allowedToSetNewStatus && currentUserRole !== 'admin') {
            alert(`Você não tem permissão para mudar para o status "${orderStatuses[newStatus].label}".`);
            selectElement.value = currentStatus; // Reimposta il selettore
            return;
        }

        if (confirm(`Deseja mudar o status do Pedido #${shipmentId} de "${orderStatuses[currentStatus].label}" para "${orderStatuses[newStatus].label}"?`)) {
            mockShipments[shipmentIndex].status = newStatus;
            mockShipments[shipmentIndex].currentChatMessages.push({
                sender: 'Sistema',
                text: `Status atualizado para "${orderStatuses[newStatus].label}" por ${currentUserRole.charAt(0).toUpperCase() + currentUserRole.slice(1)}.`,
                time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
            });

            localStorage.setItem('mockShipments', JSON.stringify(mockShipments));
            renderShipments();
            alert(`Status do Pedido #${shipmentId} atualizado para ${orderStatuses[newStatus].label}!`);
        } else {
            selectElement.value = currentStatus; // Reimposta il selettore se l'utente annulla
        }
    };

    // --- Gerenciamento de Transportadoras (Mock) ---
    const renderTransporters = () => {
        const transportersList = document.getElementById('transporters-list');
        transportersList.innerHTML = '';

        let filteredTransporters = mockTransporters;

        const searchTerm = document.getElementById('transporter-search').value.toLowerCase();
        if (searchTerm) {
            filteredTransporters = filteredTransporters.filter(transporter =>
                transporter.name.toLowerCase().includes(searchTerm) ||
                transporter.contact.toLowerCase().includes(searchTerm)
            );
        }

        const ratingFilter = parseFloat(document.getElementById('rating-filter').value);
        if (!isNaN(ratingFilter) && document.getElementById('rating-filter').value !== 'all') {
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

    // --- Gerenciamento de Notificações (Mock) ---
    const renderNotifications = () => {
        const notificationsList = document.getElementById('notifications-list');
        notificationsList.innerHTML = '';
        const mockNotifications = [
            { id: 1, text: 'Pedido #001 - Status atualizado para "Em Trânsito".', time: '10 min atrás', read: true, roles: ['logistica', 'admin'] },
            { id: 2, text: 'Novo pedido #003 adicionado por Vendas Z.', time: '2 horas atrás', read: false, roles: ['venda', 'admin'] },
            { id: 3, text: 'Você tem uma nova mensagem no chat do Pedido #002.', time: '30 min atrás', read: false, roles: ['logistica', 'venda', 'admin', 'financeiro'] },
            { id: 4, text: 'Relatório financeiro mensal disponível.', time: '1 dia atrás', read: true, roles: ['financeiro', 'admin'] }
        ];

        let filteredNotifications = mockNotifications;

        if (currentUserRole && currentUserRole !== 'admin') {
             filteredNotifications = mockNotifications.filter(notif => {
                return !notif.roles || notif.roles.includes(currentUserRole);
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


    // --- Gerenciamento de Chat (Mock con Simulação de Anexo de Arquivo) ---
    let activeChatShipmentId = null;
    let activeChatClientName = null; // Aggiunto per il nome nel titolo

    const openChat = (shipmentId, clientName) => {
        activeChatShipmentId = shipmentId;
        activeChatClientName = clientName; // Salva il nome del cliente
        const shipment = mockShipments.find(s => s.id === shipmentId);
        if (shipment) {
            chatOrderTitle.textContent = `Conversa com ${clientName} (Pedido #${shipment.id})`; // Aggiornato il titolo
            renderChatMessages(shipment.currentChatMessages || []);
            chatSection.classList.add('active');
        }
    };

    const closeChat = () => { // Funzione corretta per chiudere il chat
        chatSection.classList.remove('active');
        activeChatShipmentId = null;
        activeChatClientName = null;
        chatMessagesContainer.innerHTML = '';
        console.log("Chat fechado.");
    };

    const renderChatMessages = (messages) => {
        chatMessagesContainer.innerHTML = '';
        messages.forEach(msg => {
            const messageDiv = document.createElement('div');
            // Determina se il messaggio è "inviato da me" (mock)
            // Se il mittente include il ruolo dell'utente corrente, consideralo "sent"
            const isSentByMe = msg.sender.includes(currentUserRole.charAt(0).toUpperCase() + currentUserRole.slice(1));
            messageDiv.classList.add('chat-message', isSentByMe ? 'sent' : 'received');

            let messageContent = `<span class="message-sender">${msg.sender}</span>`;
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
        chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
    };

    const handleSendMessage = () => {
        const messageText = chatInput.value.trim();
        const selectedFile = chatFileInput.files[0];

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
            sender: `Você (${currentUserRole.charAt(0).toUpperCase() + currentUserRole.slice(1)})`,
            time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        };

        if (messageText) {
            newMessage.text = messageText;
        }

        if (selectedFile) {
            newMessage.fileUrl = URL.createObjectURL(selectedFile);
            newMessage.fileName = selectedFile.name;
            newMessage.fileType = selectedFile.type;
            console.log(`Arquivo mock carregado: ${selectedFile.name} (${selectedFile.type})`);
        }

        mockShipments[shipmentIndex].currentChatMessages.push(newMessage);
        localStorage.setItem('mockShipments', JSON.stringify(mockShipments));

        renderChatMessages(mockShipments[shipmentIndex].currentChatMessages);
        chatInput.value = '';
        chatFileInput.value = '';
    };


    // --- Event Listeners ---

    // Navegação da página de autenticação
    showRegisterLink.addEventListener('click', showRegisterSection);
    showLoginLink.addEventListener('click', showLoginSection);
    loginButton.addEventListener('click', handleLogin);
    registerButton.addEventListener('click', handleRegister);
    logoutButton.addEventListener('click', handleLogout);

    // Navegação do Dashboard
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetId = item.dataset.target;
            showSection(document.getElementById(targetId));
            updateNavActiveState(targetId);

            if (targetId === 'active-shipments-section') renderShipments();
            if (targetId === 'transporters-section') renderTransporters();
            if (targetId === 'notifications-section') renderNotifications();
        });
    });

    // Formulário Adicionar Pedido
    addOrderForm.addEventListener('submit', handleAddOrder);
    // Listener per il calcolo della percentuale in tempo reale
    freightValueInput.addEventListener('input', calculateFreightPercentage);
    orderValueInput.addEventListener('input', calculateFreightPercentage);


    // Busca e Filtro de Envios
    shipmentSearchInput.addEventListener('input', renderShipments);
    statusFilterSelect.addEventListener('change', renderShipments);

    // Busca e Filtro de Transportadoras
    document.getElementById('transporter-search').addEventListener('input', renderTransporters);
    document.getElementById('rating-filter').addEventListener('change', renderTransporters);

    // Eventos do Chat
    sendChatBtn.addEventListener('click', handleSendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSendMessage();
        }
    });
    closeChatBtn.addEventListener('click', closeChat); // Il pulsante X per chiudere il chat

    // Controles do Mapa Mock
    document.getElementById('update-location-btn').addEventListener('click', () => {
        const selectOrderForMap = document.getElementById('select-order-for-map');
        const selectedOrderId = selectOrderForMap.value;
        if (selectedOrderId) {
            alert(`Simulando atualização de localização para Pedido #${selectedOrderId}. (Isso envolveria API de mapas e dados reais em um ambiente real.)`);
        } else {
            alert('Por favor, selecione um pedido para atualizar a localização.');
        }
    });

    // Funzione per popolare il select del mapa
    const populateMapOrderSelect = () => {
        const selectOrderForMap = document.getElementById('select-order-for-map');
        selectOrderForMap.innerHTML = '<option value="">Selecione um Pedido</option>';
        mockShipments.forEach(shipment => {
            const option = document.createElement('option');
            option.value = shipment.id;
            option.textContent = `Pedido #${shipment.id} - ${shipment.client}`;
            selectOrderForMap.appendChild(option);
        });
    };


    // --- Carregamento Iniziale ---
    checkAuthStatus();
    populateMapOrderSelect(); // Popola il selettore del mapa all'avvio
});
