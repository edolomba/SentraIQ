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
    const registerRoleSelect = document.getElementById('register-role'); // Novo: Seleção de Papel

    const dashboardPage = document.getElementById('dashboard-page');
    const displayUserEmail = document.getElementById('display-user-email');
    const displayUserRole = document.getElementById('display-user-role');

    // Seções do Dashboard
    const addOrderSection = document.getElementById('add-order-section');
    const activeShipmentsSection = document.getElementById('active-shipments-section');
    const transportersSection = document.getElementById('transporters-section');
    const notificationsSection = document.getElementById('notifications-section');
    const chatSection = document.getElementById('chat-section');
    const mapSection = document.getElementById('map-section'); // Novo: Seção do Mapa

    const navItems = document.querySelectorAll('.bottom-nav .nav-item');

    // Formulário Adicionar Pedido
    const addOrderForm = document.getElementById('add-order-form');
    const clientNameInput = document.getElementById('client-name');
    const deliveryAddressInput = document.getElementById('delivery-address');
    const productDescriptionInput = document.getElementById('product-description');
    const deliveryDateInput = document.getElementById('delivery-date');

    // Lista de Envios
    const shipmentsList = document.getElementById('shipments-list');
    const shipmentSearchInput = document.getElementById('shipment-search');
    const statusFilterSelect = document.getElementById('status-filter');

    // Chat
    const chatOrderTitle = document.getElementById('chat-order-title');
    const chatMessagesContainer = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const chatFileInput = document.getElementById('chat-file-input'); // Novo: Input de arquivo
    const sendChatBtn = document.getElementById('send-chat-btn');
    const closeChatBtn = document.getElementById('close-chat-btn');

    // Dados Mock (simulados) para Envios e Transportadoras
    let mockShipments = JSON.parse(localStorage.getItem('mockShipments')) || [
        { id: '1', client: 'Cliente A', address: 'Rua X, 123', product: 'Celular', date: '2025-06-15', status: 'pending', createdBy: 'vendas@example.com', currentChatMessages: [{sender: 'Sistema', text: 'Chat iniciado para Pedido #001', time: '10:00'}] },
        { id: '2', client: 'Cliente B', address: 'Av. Y, 456', product: 'Geladeira', date: '2025-06-20', status: 'in-transit', createdBy: 'logistica@example.com', currentChatMessages: [{sender: 'Sistema', text: 'Chat iniciado para Pedido #002', time: '11:00'}] },
        { id: '3', client: 'Cliente C', address: 'Via Z, 789', product: 'TV', date: '2025-07-01', status: 'delivered', createdBy: 'vendas@example.com', currentChatMessages: [{sender: 'Sistema', text: 'Chat iniciado para Pedido #003', time: '12:00'}] }
    ];
    let mockTransporters = JSON.parse(localStorage.getItem('mockTransporters')) || [
        { name: 'Transportadora A', contact: '(11) 9876-5432', rating: 4.5 },
        { name: 'Transportadora B', contact: '(21) 1234-5678', rating: 4.0 },
        { name: 'Transportadora C', contact: '(31) 5555-4444', rating: 3.8 }
    ];
    
    // Variáveis para o usuário logado
    let currentUserRole = null;
    let currentUserId = null; // Simulará um ID de usuário para o chat
    let currentUserEmail = null;

    // --- Funções de Utilitário ---

    // Função para mostrar uma seção específica e ocultar as outras
    const showSection = (sectionElement) => {
        document.querySelectorAll('.dashboard-section').forEach(sec => sec.classList.remove('active'));
        if (sectionElement) { // Verifica se o elemento existe antes de adicionar a classe
            sectionElement.classList.add('active');
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
        addOrderSection.classList.add('hidden');
        activeShipmentsSection.classList.add('hidden');
        transportersSection.classList.add('hidden');
        notificationsSection.classList.add('hidden');
        mapSection.classList.add('hidden');
        // A seção de chat é um overlay e é gerenciada separadamente

        // Mostra elementos com base no currentUserRole
        if (currentUserRole) {
            // Regras de visibilidade:
            // Admin vê tudo
            // Vendas pode adicionar pedidos e ver seus envios
            // Logística vê envios e transportadoras
            // Financeiro vê notificações e transportadoras (pode ter relatórios futuros)

            switch (currentUserRole) {
                case 'venda':
                    addOrderSection.classList.remove('hidden'); // Vendas pode adicionar pedidos
                    activeShipmentsSection.classList.remove('hidden'); // Vendas vê os envios
                    // Vendas pode ver transportadoras e notificações se necessário
                    transportersSection.classList.remove('hidden');
                    notificationsSection.classList.remove('hidden');
                    break;
                case 'logistica':
                    activeShipmentsSection.classList.remove('hidden');
                    transportersSection.classList.remove('hidden');
                    notificationsSection.classList.remove('hidden');
                    mapSection.classList.remove('hidden'); // Logística pode ver o mapa
                    break;
                case 'financeiro':
                    notificationsSection.classList.remove('hidden');
                    transportersSection.classList.remove('hidden');
                    // Pode ver relatórios financeiros futuros aqui
                    break;
                case 'admin':
                    // Administrador vê TUDO
                    addOrderSection.classList.remove('hidden');
                    activeShipmentsSection.classList.remove('hidden');
                    transportersSection.classList.remove('hidden');
                    notificationsSection.classList.remove('hidden');
                    mapSection.classList.remove('hidden');
                    break;
                default:
                    // Fallback para papéis desconhecidos ou vazios
                    break;
            }
        }
        // Garante que uma seção ativa seja mostrada, geralmente a de envios
        showSection(activeShipmentsSection); // Visão padrão após o login
        updateNavActiveState('active-shipments-section');
    };


    const checkAuthStatus = () => {
        const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
        if (loggedInUser && loggedInUser.email && loggedInUser.role) {
            currentUserEmail = loggedInUser.email;
            currentUserRole = loggedInUser.role;
            currentUserId = loggedInUser.email.split('@')[0]; // Simula um ID de usuário

            displayUserEmail.textContent = currentUserEmail;
            displayUserRole.textContent = currentUserRole.charAt(0).toUpperCase() + currentUserRole.slice(1); // Capitaliza a primeira letra

            authPage.classList.remove('active'); // Esconde a página de autenticação
            dashboardPage.classList.add('active');   // Mostra o dashboard
            
            updateUIVisibility(); // Ajusta a UI com base no papel
            renderShipments(); // Renderiza os envios para o usuário atual
            renderTransporters(); // Renderiza as transportadoras
            renderNotifications(); // Renderiza as notificações
        } else {
            authPage.classList.add('active');    // Mostra a página de autenticação
            dashboardPage.classList.remove('active'); // Esconde o dashboard
            showLoginSection(); // Garante que a seção de login esteja visível
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

        // Mocking user check: verifica se o usuário existe no mock storage
        const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers')) || {};
        if (registeredUsers[email] && registeredUsers[email].password === password) {
            localStorage.setItem('loggedInUser', JSON.stringify({ email: email, role: registeredUsers[email].role }));
            alert('Login realizado com sucesso!');
            checkAuthStatus(); // <-- CHIAMATA CRUCIALE per mostrare il dashboard
        } else {
            alert('Credenciais inválidas ou usuário não cadastrado.');
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

        // Mocking user registration: salva no localStorage
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
        registerRoleSelect.value = ''; // Limpa a seleção de papel
    };

    const handleLogout = () => {
        localStorage.removeItem('loggedInUser');
        currentUserEmail = null;
        currentUserRole = null;
        currentUserId = null;
        alert('Você saiu da conta.');
        checkAuthStatus(); // Re-verifica o status para retornar à tela de login
    };

    // --- Gerenciamento de Envios (Mock) ---

    const renderShipments = () => {
        shipmentsList.innerHTML = ''; // Limpa a lista atual
        let filteredShipments = mockShipments;

        // Aplica filtro de busca
        const searchTerm = shipmentSearchInput.value.toLowerCase();
        if (searchTerm) {
            filteredShipments = filteredShipments.filter(shipment =>
                shipment.client.toLowerCase().includes(searchTerm) ||
                shipment.product.toLowerCase().includes(searchTerm) ||
                shipment.address.toLowerCase().includes(searchTerm)
            );
        }

        // Aplica filtro de status
        const statusFilter = statusFilterSelect.value;
        if (statusFilter !== 'all') {
            filteredShipments = filteredShipments.filter(shipment => shipment.status === statusFilter);
        }

        // Aplica filtro baseado em papel (NOVO!)
        if (currentUserRole && currentUserRole !== 'admin') {
            filteredShipments = filteredShipments.filter(shipment => {
                if (currentUserRole === 'venda') {
                    // Vendas vê apenas os envios que criou
                    return shipment.createdBy === currentUserEmail;
                }
                // Para logística, financeiro, eles veriam todos dentro da empresa
                // Para este mock, assumiremos que 'logistica' e 'financeiro' vêem todos os envios.
                // Em um aplicativo real, isso seria baseado em companyId.
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
            // Apenas Logística e Admin podem atualizar o status neste mock
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

        // Adiciona event listeners aos botões recém-renderizados
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
            status: 'pending', // Status padrão para novos pedidos
            createdBy: currentUserEmail, // Rastreia quem criou o pedido
            currentChatMessages: [{sender: 'Sistema', text: `Chat iniciado para Pedido #${newOrderId}`, time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}]
        };

        mockShipments.push(newOrder);
        localStorage.setItem('mockShipments', JSON.stringify(mockShipments)); // Salva no mock storage
        alert('Novo pedido adicionado com sucesso!');
        addOrderForm.reset(); // Limpa o formulário
        renderShipments(); // Re-renderiza os envios para mostrar o novo
        showSection(activeShipmentsSection); // Volta para a lista de envios
        updateNavActiveState('active-shipments-section');
    };

    const handleUpdateStatus = (button) => {
        const shipmentCard = button.closest('.shipment-card');
        const shipmentId = shipmentCard.dataset.id;
        const currentStatus = button.dataset.currentStatus;

        // Definindo a ordem das transições de status
        const statusOptions = ['pending', 'in-transit', 'delivered', 'cancelled'];
        const currentIndex = statusOptions.indexOf(currentStatus);
        
        let nextStatus;
        if (currentStatus === 'delivered' || currentStatus === 'cancelled') {
            // Se já está entregue ou cancelado, não muda mais
            alert('Este pedido já foi finalizado ou cancelado e não pode ter o status atualizado.');
            return;
        } else {
            // Cicla para o próximo status na ordem
            nextStatus = statusOptions[(currentIndex + 1) % statusOptions.length]; 
        }

        if (confirm(`Deseja mudar o status do Pedido #${shipmentId} de "${currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1).replace('-', ' ')}" para "${nextStatus.charAt(0).toUpperCase() + nextStatus.slice(1).replace('-', ' ')}"?`)) {
            const shipmentIndex = mockShipments.findIndex(s => s.id === shipmentId);
            if (shipmentIndex !== -1) {
                mockShipments[shipmentIndex].status = nextStatus;
                // Adiciona uma mensagem de chat mock sobre a atualização de status
                mockShipments[shipmentIndex].currentChatMessages.push({
                    sender: 'Sistema',
                    text: `Status atualizado para "${nextStatus.charAt(0).toUpperCase() + nextStatus.slice(1).replace('-', ' ')}" por ${currentUserRole.charAt(0).toUpperCase() + currentUserRole.slice(1)}.`,
                    time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                });

                localStorage.setItem('mockShipments', JSON.stringify(mockShipments));
                renderShipments(); // Re-renderiza para refletir as mudanças
                alert(`Status do Pedido #${shipmentId} atualizado para ${nextStatus.charAt(0).toUpperCase() + nextStatus.slice(1).replace('-', ' ')}!`);
            }
        }
    };

    // --- Gerenciamento de Transportadoras (Mock) ---
    const renderTransporters = () => {
        const transportersList = document.getElementById('transporters-list');
        transportersList.innerHTML = '';

        let filteredTransporters = mockTransporters;

        // Aplica filtro de busca (mock)
        const searchTerm = document.getElementById('transporter-search').value.toLowerCase();
        if (searchTerm) {
            filteredTransporters = filteredTransporters.filter(transporter =>
                transporter.name.toLowerCase().includes(searchTerm) ||
                transporter.contact.toLowerCase().includes(searchTerm)
            );
        }

        // Aplica filtro de avaliação (mock)
        const ratingFilter = parseFloat(document.getElementById('rating-filter').value);
        if (!isNaN(ratingFilter) && document.getElementById('rating-filter').value !== 'all') { // Check for 'all' string
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
        // Notificações Mock - em um aplicativo real, viriam de um banco de dados
        const mockNotifications = [
            { id: 1, text: 'Pedido #001 - Status atualizado para "Em Trânsito".', time: '10 min atrás', read: true, roles: ['logistica', 'admin'] },
            { id: 2, text: 'Novo pedido #003 adicionado por Vendas Z.', time: '2 horas atrás', read: false, roles: ['venda', 'admin'] },
            { id: 3, text: 'Você tem uma nova mensagem no chat do Pedido #002.', time: '30 min atrás', read: false, roles: ['logistica', 'venda', 'admin', 'financeiro'] },
            { id: 4, text: 'Relatório financeiro mensal disponível.', time: '1 dia atrás', read: true, roles: ['financeiro', 'admin'] }
        ];

        let filteredNotifications = mockNotifications;

        // Filtra notificações com base no papel (lógica mock)
        if (currentUserRole && currentUserRole !== 'admin') {
             filteredNotifications = mockNotifications.filter(notif => {
                // Se uma notificação tem a propriedade 'roles', mostra apenas para esses papéis
                // Se não tem 'roles', mostra para todos (notificações gerais)
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


    // --- Gerenciamento de Chat (Mock com Simulação de Anexo de Arquivo) ---
    let activeChatShipmentId = null;

    const openChat = (shipmentId) => {
        activeChatShipmentId = shipmentId;
        const shipment = mockShipments.find(s => s.id === shipmentId);
        if (shipment) {
            chatOrderTitle.textContent = `Chat do Pedido #${shipment.id} - ${shipment.client}`;
            renderChatMessages(shipment.currentChatMessages || []);
            chatSection.classList.add('active'); // Mostra o overlay do chat
        }
    };

    const closeChat = () => {
        chatSection.classList.remove('active'); // Oculta o overlay do chat
        activeChatShipmentId = null;
        chatMessagesContainer.innerHTML = ''; // Limpa as mensagens
    };

    const renderChatMessages = (messages) => {
        chatMessagesContainer.innerHTML = '';
        messages.forEach(msg => {
            const messageDiv = document.createElement('div');
            // Mock do remetente, app real verificaria se sender.uid === currentUser.uid
            const isSentByMe = msg.sender.includes(`Você (${currentUserRole.charAt(0).toUpperCase() + currentUserRole.slice(1)})`); // Verificação mock simples
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
        chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight; // Rola para o final
    };

    const handleSendMessage = () => {
        const messageText = chatInput.value.trim();
        const selectedFile = chatFileInput.files[0]; // Pega o arquivo selecionado

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
            sender: `Você (${currentUserRole.charAt(0).toUpperCase() + currentUserRole.slice(1)})`, // Remetente Mock
            time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        };

        if (messageText) {
            newMessage.text = messageText;
        }

        // --- Simulação de Upload de Arquivo ---
        if (selectedFile) {
            // Em um app real, você faria o upload deste arquivo para o Firebase Storage
            // Por enquanto, criaremos uma URL mock e informações do arquivo
            newMessage.fileUrl = URL.createObjectURL(selectedFile); // Cria uma URL temporária
            newMessage.fileName = selectedFile.name;
            newMessage.fileType = selectedFile.type;
            console.log(`Arquivo mock carregado: ${selectedFile.name} (${selectedFile.type})`);
        }

        mockShipments[shipmentIndex].currentChatMessages.push(newMessage);
        localStorage.setItem('mockShipments', JSON.stringify(mockShipments)); // Atualiza o mock storage

        renderChatMessages(mockShipments[shipmentIndex].currentChatMessages);
        chatInput.value = ''; // Limpa o input de texto
        chatFileInput.value = ''; // Limpa o input de arquivo
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

            // Re-renderiza certas seções ao navegar para elas para garantir que os filtros sejam aplicados
            if (targetId === 'active-shipments-section') renderShipments();
            if (targetId === 'transporters-section') renderTransporters();
            if (targetId === 'notifications-section') renderNotifications();
        });
    });

    // Formulário Adicionar Pedido
    addOrderForm.addEventListener('submit', handleAddOrder);

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
            e.preventDefault(); // Impede o envio do formulário padrão se houver
            handleSendMessage();
        }
    });
    closeChatBtn.addEventListener('click', closeChat);

    // Controles do Mapa Mock
    document.getElementById('update-location-btn').addEventListener('click', () => {
        const selectedOrder = document.getElementById('select-order-for-map').value;
        if (selectedOrder) {
            alert(`Simulando atualização de localização para Pedido #${selectedOrder}. (Isso envolveria API de mapas e dados reais em um ambiente real.)`);
        } else {
            alert('Por favor, selecione um pedido para atualizar a localização.');
        }
    });


    // --- Carregamento Inicial ---
    checkAuthStatus(); // Verifica se o usuário já está logado ao carregar a página
});
