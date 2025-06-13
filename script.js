document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded - script.js iniciado.');

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
    const chatSection = document.getElementById('chat-section'); // Chat por Pedido (AGORA É SEÇÃO)
    const internalChatSection = document.getElementById('internal-chat-section'); // NOVO: Chat Interno
    const mapSection = document.getElementById('map-section');

    const navItems = document.querySelectorAll('.bottom-nav .nav-item');
    const internalChatNavIndicator = document.getElementById('internal-chat-indicator');

    // Formulário Adicionar Pedido (Campos para Vendedor)
    const addOrderForm = document.getElementById('add-order-form');
    const clientNameInput = document.getElementById('client-name');
    const productDescriptionInput = document.getElementById('product-description');
    const departureAddressInput = document.getElementById('departure-address');
    const deliveryAddressInput = document.getElementById('delivery-address');
    const deliveryDateInput = document.getElementById('delivery-date');

    // Lista de Envios
    const shipmentsList = document.getElementById('shipments-list');
    const shipmentSearchInput = document.getElementById('shipment-search');
    const statusFilterSelect = document.getElementById('status-filter');

    // Chat por Pedido
    const chatOrderTitle = document.getElementById('chat-order-title');
    const chatMessagesContainer = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const chatFileInput = document.getElementById('chat-file-input');
    const sendChatBtn = document.getElementById('send-chat-btn');
    const closeChatBtn = document.getElementById('close-chat-btn'); // AGORA PARA VOLTAR AOS ENVIOS

    // NOVO: Chat Interno
    const internalChatMessagesContainer = document.getElementById('internal-chat-messages');
    const internalChatInput = document.getElementById('internal-chat-input');
    const sendInternalChatBtn = document.getElementById('send-internal-chat-btn');

    // Dados Mock (simulados)
    let mockShipments = JSON.parse(localStorage.getItem('mockShipments')) || [
        { id: '1', client: 'Cliente A', product: 'Celular', freightValue: 10.00, orderValue: 200.00, departureAddress: 'Rua Alfa, 100', deliveryAddress: 'Rua X, 123', date: '2025-06-20', status: 'em_transito', createdBy: 'venda@example.com', currentChatMessages: [{sender: 'Sistema', text: 'Chat iniciado para Pedido #001', time: '10:00'}], lastStatusUpdateTime: '2025-06-10', hasNewMessages: false },
        { id: '2', client: 'Cliente B', product: 'Geladeira', freightValue: null, orderValue: null, departureAddress: 'Av. Beta, 200', deliveryAddress: 'Av. Y, 456', date: '2025-06-25', status: 'venda_concluida', createdBy: 'venda@example.com', currentChatMessages: [{sender: 'Sistema', text: 'Chat iniciado para Pedido #002', time: '11:00'}], lastStatusUpdateTime: '2025-06-05', hasNewMessages: true }, // Exemplo de mensagem nova
        { id: '3', client: 'Cliente C', product: 'TV', freightValue: 30.00, orderValue: 1000.00, departureAddress: 'Praça Gama, 300', deliveryAddress: 'Via Z, 789', date: '2025-07-01', status: 'retirado_cliente', createdBy: 'logistica@example.com', currentChatMessages: [{sender: 'Sistema', text: 'Chat iniciado para Pedido #003', time: '12:00'}], lastStatusUpdateTime: '2025-06-12', hasNewMessages: false }
    ];
    let mockTransporters = JSON.parse(localStorage.getItem('mockTransporters')) || [
        { name: 'Transportadora A', contact: '(11) 9876-5432', rating: 4.5 },
        { name: 'Transportadora B', contact: '(21) 1234-5678', rating: 4.0 },
        { name: 'Transportadora C', contact: '(31) 5555-4444', rating: 3.8 }
    ];
    let mockInternalChatMessages = JSON.parse(localStorage.getItem('mockInternalChatMessages')) || [
        { sender: 'Sistema', text: 'Bem-vindos ao chat interno!', time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) }
    ];
    let hasNewInternalMessages = JSON.parse(localStorage.getItem('hasNewInternalMessages')) || false;

    // Variáveis para o usuário logado
    let currentUserRole = null;
    let currentUserId = null;
    let currentUserEmail = null;

    // --- Funções de Utilitário ---

    // Função para mostrar uma seção específica e ocultar as outras
    const showSection = (sectionElement) => {
        // console.log('showSection: Tentando mostrar a seção:', sectionElement ? sectionElement.id : 'NULO');
        document.querySelectorAll('.dashboard-section').forEach(sec => {
            sec.classList.remove('active');
        });
        if (sectionElement) {
            sectionElement.classList.add('active');
            // console.log(`Seção ${sectionElement.id} marcada como ativa.`);
        }
    };

    // Atualiza o estado ativo da navegação inferior
    const updateNavActiveState = (targetId) => {
        // console.log('updateNavActiveState: Ativando item de navegação:', targetId);
        navItems.forEach(item => {
            if (item.dataset.target === targetId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
        updateChatIndicators(); // Atualiza indicadores de mensagem ao mudar de seção
    };

    // --- Gerenciamento de Autenticação e Estado do Usuário (Mock) ---

    // Função para atualizar a UI com base no papel do usuário
    const updateUIVisibility = () => {
        // console.log('updateUIVisibility: Atualizando visibilidade para o papel:', currentUserRole);
        // Oculta todas as seções do dashboard e itens de navegação por padrão
        document.querySelectorAll('.dashboard-section').forEach(sec => sec.classList.add('hidden'));
        document.querySelectorAll('.bottom-nav .nav-item').forEach(item => item.classList.add('hidden'));

        // Define quais seções e itens de navegação são visíveis para cada papel
        const rolePermissions = {
            'venda': {
                sections: [addOrderSection, activeShipmentsSection, transportersSection, notificationsSection, internalChatSection],
                navItems: ['add-order-section', 'active-shipments-section', 'transporters-section', 'notifications-section', 'internal-chat-section']
            },
            'logistica': {
                sections: [activeShipmentsSection, transportersSection, notificationsSection, mapSection, internalChatSection],
                navItems: ['active-shipments-section', 'transporters-section', 'notifications-section', 'map-section', 'internal-chat-section']
            },
            'financeiro': {
                sections: [activeShipmentsSection, transportersSection, notificationsSection, internalChatSection],
                navItems: ['active-shipments-section', 'transporters-section', 'notifications-section', 'internal-chat-section']
            },
            'admin': { // Admin vê tudo
                sections: [addOrderSection, activeShipmentsSection, transportersSection, notificationsSection, chatSection, internalChatSection, mapSection], // Chat Section como seção normal
                navItems: ['add-order-section', 'active-shipments-section', 'transporters-section', 'notifications-section', 'internal-chat-section', 'map-section']
            }
        };

        const currentRolePermissions = rolePermissions[currentUserRole];

        if (currentRolePermissions) {
            currentRolePermissions.sections.forEach(sec => sec.classList.remove('hidden'));
            currentRolePermissions.navItems.forEach(targetId => {
                const navItem = document.querySelector(`.bottom-nav .nav-item[data-target="${targetId}"]`);
                if (navItem) navItem.classList.remove('hidden');
            });
        }

        // Garante que uma seção ativa seja mostrada, geralmente a de envios
        showSection(activeShipmentsSection); // Visão padrão após o login
        updateNavActiveState('active-shipments-section');
    };

    const checkAuthStatus = () => {
        console.log('checkAuthStatus: Verificando status de autenticação.');
        const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
        if (loggedInUser && loggedInUser.email && loggedInUser.role) {
            console.log('checkAuthStatus: Usuário logado encontrado:', loggedInUser.email);
            currentUserEmail = loggedInUser.email;
            currentUserRole = loggedInUser.role;
            currentUserId = loggedInUser.email.split('@')[0];

            displayUserEmail.textContent = currentUserEmail;
            displayUserRole.textContent = currentUserRole.charAt(0).toUpperCase() + currentUserRole.slice(1);

            // Garante que a página de autenticação suma e o dashboard apareça
            authPage.classList.remove('active'); // Remove a classe 'active' para iniciar a transição CSS de ocultação
            dashboardPage.classList.add('active'); // Adiciona a classe 'active' para exibir o dashboard

            // Usa setTimeout para garantir que 'display: none' seja aplicado *depois* da transição visual
            setTimeout(() => {
                authPage.style.display = 'none'; // Esconde a página de login completamente após a transição
            }, 300); // Duração da transição CSS (deve ser a mesma do CSS para .auth-container:not(.active))

            // Renderiza o conteúdo do dashboard
            updateUIVisibility();
            renderShipments();
            renderTransporters();
            renderNotifications();
            renderInternalChatMessages(); // Carrega mensagens do chat interno
            populateMapOrderSelect();
            updateChatIndicators(); // Atualiza indicadores após login

        } else {
            console.log('checkAuthStatus: Nenhum usuário logado. Mostrando página de autenticação.');
            // Garante que a página de autenticação seja visível e o dashboard oculto
            authPage.classList.add('active');
            authPage.style.display = 'flex'; // Garante que esteja visível para a transição
            dashboardPage.classList.remove('active'); // Garante que o dashboard esteja oculto

            showLoginSection(); // Mostra a seção de login por padrão
        }
    };

    const showLoginSection = () => {
        // console.log('showLoginSection: Exibindo seção de login.');
        loginSection.classList.add('active');
        registerSection.classList.remove('active');
    };

    const showRegisterSection = () => {
        // console.log('showRegisterSection: Exibindo seção de cadastro.');
        loginSection.classList.remove('active');
        registerSection.classList.add('active');
    };

    const handleLogin = (e) => {
        e.preventDefault();
        console.log('handleLogin: Botão de Login clicado.');
        const email = loginEmailInput.value;
        const password = loginPasswordInput.value;

        const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers')) || {};
        if (registeredUsers[email] && registeredUsers[email].password === password) {
            localStorage.setItem('loggedInUser', JSON.stringify({ email: email, role: registeredUsers[email].role }));
            alert('Login realizado com sucesso!');
            checkAuthStatus(); // Re-verifica o status de autenticação para exibir o dashboard
        } else {
            alert('Credenciais inválidas ou usuário não cadastrado.');
        }
    };

    const handleRegister = (e) => {
        e.preventDefault();
        console.log('handleRegister: Botão de Cadastro clicado.');
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
        console.log('handleLogout: Botão de Sair clicado.');
        localStorage.removeItem('loggedInUser');
        currentUserEmail = null;
        currentUserRole = null;
        currentUserId = null;
        alert('Você saiu da conta.');
        checkAuthStatus(); // Re-verifica o status de autenticação para exibir a página de login
    };

    // --- Gerenciamento de Envios (Mock) ---

    // Definizione degli stati possibili per un ordine e chi può cambiarli
    const orderStatuses = {
        'pending': { label: 'Pendente', allowedRolesToSet: ['venda', 'admin'], nextStates: ['venda_concluida', 'cancelled'], responsibleRole: 'venda' },
        'venda_concluida': { label: 'Venda Concluída', allowedRolesToSet: ['venda', 'admin'], nextStates: ['nota_fiscal_emitida', 'cancelled'], responsibleRole: 'financeiro' },
        'nota_fiscal_emitida': { label: 'Nota Fiscal Emitida', allowedRolesToSet: ['financeiro', 'admin'], nextStates: ['coletado', 'cancelled'], responsibleRole: 'logistica' },
        'coletado': { label: 'Coletado', allowedRolesToSet: ['logistica', 'admin'], nextStates: ['em_transito', 'cancelled'], responsibleRole: 'logistica' },
        'em_transito': { label: 'Em Trânsito', allowedRolesToSet: ['logistica', 'admin'], nextStates: ['em_rota_entrega', 'cancelled'], responsibleRole: 'logistica' },
        'em_rota_entrega': { label: 'Em Rota de Entrega', allowedRolesToSet: ['logistica', 'admin'], nextStates: ['retirado_cliente', 'cancelled'], responsibleRole: 'logistica' },
        'retirado_cliente': { label: 'Retirado pelo Cliente', allowedRolesToSet: ['logistica', 'admin'], nextStates: [], responsibleRole: 'logistica' }, // Final State
        'cancelled': { label: 'Cancelado', allowedRolesToSet: ['venda', 'financeiro', 'logistica', 'admin'], nextStates: [], responsibleRole: 'N/A' } // Final State
    };

    // Função para calcular o tempo restante
    const getRemainingTime = (deliveryDateString) => {
        const deliveryDate = new Date(deliveryDateString);
        deliveryDate.setHours(23, 59, 59, 999); // Fim do dia da entrega
        const now = new Date();
        const diff = deliveryDate.getTime() - now.getTime(); // Diferença em milissegundos

        if (diff < 0) {
            return { days: 0, hours: 0, minutes: 0, late: true };
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        return { days, hours, minutes, late: false };
    };

    // Função para renderizar os shipments
    const renderShipments = () => {
        // console.log('renderShipments: Renderizando a lista de envios.');
        shipmentsList.innerHTML = '';
        let filteredShipments = mockShipments;

        const searchTerm = shipmentSearchInput.value.toLowerCase();
        if (searchTerm) {
            filteredShipments = filteredShipments.filter(shipment =>
                shipment.client.toLowerCase().includes(searchTerm) ||
                shipment.product.toLowerCase().includes(searchTerm) ||
                shipment.departureAddress.toLowerCase().includes(searchTerm) ||
                shipment.deliveryAddress.toLowerCase().includes(searchTerm)
            );
        }

        const statusFilter = statusFilterSelect.value;
        if (statusFilter !== 'all') {
            filteredShipments = filteredShipments.filter(shipment => shipment.status === statusFilter);
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

            let freightInfoHtml = '';
            let freightPercentage = null;
            let freightColor = 'initial'; // Cor padrão

            if (shipment.freightValue !== null && shipment.orderValue !== null && shipment.orderValue > 0) {
                freightPercentage = (shipment.freightValue / shipment.orderValue * 100).toFixed(2);
                freightColor = parseFloat(freightPercentage) <= 4 ? 'green' : 'red';
                freightInfoHtml = `
                    <p class="freight-info">Valor Frete: R$ ${shipment.freightValue.toFixed(2)} / Pedido: R$ ${shipment.orderValue.toFixed(2)}</p>
                    <p class="freight-info">Percentual Frete: <span class="percentage-display ${freightColor}">${freightPercentage}%</span></p>
                `;
            } else if (currentUserRole === 'logistica' && shipment.status === 'nota_fiscal_emitida') {
                // Permite Logística inserir valores se o status for Nota Fiscal Emitida
                freightInfoHtml = `
                    <div class="freight-value-inputs">
                        <label for="input-freight-${shipment.id}">Valor do Frete (R$):</label>
                        <input type="number" id="input-freight-${shipment.id}" step="0.01" min="0" value="${shipment.freightValue || ''}" required>
                        <label for="input-order-${shipment.id}">Valor Total do Pedido (R$):</label>
                        <input type="number" id="input-order-${shipment.id}" step="0.01" min="0" value="${shipment.orderValue || ''}" required>
                        <button class="btn-primary save-freight-btn" data-id="${shipment.id}">Salvar Valores Frete</button>
                    </div>
                `;
            } else {
                 freightInfoHtml = `<p>Valores de frete e pedido pendentes.</p>`;
            }

            const timeRemaining = getRemainingTime(shipment.date);
            let timerClass = '';
            let timerText = '';
            if (timeRemaining.late) {
                timerClass = 'late';
                timerText = `Atrasado!`;
            } else if (timeRemaining.days < 2 && shipment.status !== 'retirado_cliente' && shipment.status !== 'cancelled') {
                 timerClass = 'warning';
                 timerText = `Entrega em ${timeRemaining.days}d ${timeRemaining.hours}h ${timeRemaining.minutes}m`;
            } else if (shipment.status === 'retirado_cliente' || shipment.status === 'cancelled') {
                timerText = `Entrega Concluída/Cancelada`;
            } else {
                timerText = `Entrega em ${timeRemaining.days}d ${timeRemaining.hours}h ${timeRemaining.minutes}m`;
            }


            let updateButtonHtml = '';
            const nextAllowedStatesForShipment = orderStatuses[shipment.status].nextStates;
            const allowedStatesForCurrentUser = [];

            nextAllowedStatesForShipment.forEach(stateKey => {
                if (orderStatuses[stateKey] && (orderStatuses[stateKey].allowedRolesToSet.includes(currentUserRole) || currentUserRole === 'admin')) {
                    allowedStatesForCurrentUser.push(stateKey);
                }
            });

            if (allowedStatesForCurrentUser.length > 0) {
                let optionsHtml = allowedStatesForCurrentUser.map(stateKey => 
                    `<option value="${stateKey}">${orderStatuses[stateKey].label}</option>`
                ).join('');
                updateButtonHtml = `
                    <select class="status-selector" data-shipment-id="${shipment.id}" data-current-status="${shipment.status}">
                        <option value="">Mudar Status</option>
                        ${optionsHtml}
                    </select>
                `;
            }

            const chatButtonText = shipment.hasNewMessages ? 'Ver Chat (Nova Msg!)' : 'Ver Chat';

            shipmentCard.innerHTML = `
                <div class="card-header">
                    <h3>Pedido #${shipment.id} - ${shipment.client}</h3>
                    <span class="status ${shipment.status}">${currentStatusLabel}</span>
                </div>
                <p>Produto: ${shipment.product}</p>
                <p>De: ${shipment.departureAddress}</p>
                <p>Para: ${shipment.deliveryAddress}</p>
                <p>Data de Entrega: ${shipment.date}</p>
                <p class="shipment-timer ${timerClass}">${timerText}</p>
                ${freightInfoHtml}
                <p>Criado por: ${shipment.createdBy}</p>
                <div class="card-actions">
                    ${updateButtonHtml}
                    <button class="btn-secondary view-chat-btn" data-id="${shipment.id}" data-client-name="${shipment.client}">${chatButtonText}</button>
                </div>
            `;
            shipmentsList.appendChild(shipmentCard);
        });

        // RE-ATTACHING EVENT LISTENERS FOR DYNAMICALLY CREATED ELEMENTS
        // ESSENCIAL: Event listeners para elementos criados dinamicamente devem ser anexados APÓS a criação do HTML.
        document.querySelectorAll('.status-selector').forEach(select => {
            select.onchange = (e) => handleUpdateStatus(e.target);
        });
        document.querySelectorAll('.view-chat-btn').forEach(button => {
            button.onclick = (e) => openChat(e.target.dataset.id, e.target.dataset.clientName);
        });
        document.querySelectorAll('.save-freight-btn').forEach(button => {
            button.onclick = (e) => handleSaveFreightValues(e.target.dataset.id);
        });
        // console.log('renderShipments: Event listeners para cards de envio re-anexados.');
    };

    const handleAddOrder = async (e) => {
        e.preventDefault();
        // console.log('handleAddOrder: Botão Adicionar Pedido clicado.');

        // Apenas Vendedor e Admin podem adicionar novos pedidos
        if (currentUserRole !== 'venda' && currentUserRole !== 'admin') {
            alert('Você não tem permissão para adicionar novos pedidos.');
            return;
        }

        const clientName = clientNameInput.value;
        const productDescription = productDescriptionInput.value;
        const departureAddress = departureAddressInput.value;
        const deliveryAddress = deliveryAddressInput.value;
        const deliveryDate = deliveryDateInput.value;

        if (!clientName || !productDescription || !departureAddress || !deliveryAddress || !deliveryDate) {
            alert('Por favor, preencha todos os campos do pedido.');
            return;
        }

        const newOrderId = (mockShipments.length > 0 ? Math.max(...mockShipments.map(s => parseInt(s.id))) + 1 : 1).toString();

        const newOrder = {
            id: newOrderId,
            client: clientName,
            product: productDescription,
            freightValue: null, // Vendedor não insere valor do frete
            orderValue: null,   // Vendedor não insere valor do pedido
            departureAddress: departureAddress,
            deliveryAddress: deliveryAddress,
            date: deliveryDate,
            status: 'pending', // Inicia sempre como 'pending'
            createdBy: currentUserEmail,
            currentChatMessages: [{sender: 'Sistema', text: `Chat iniciado para Pedido #${newOrderId}`, time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}],
            lastStatusUpdateTime: new Date().toISOString().split('T')[0], // Data atual
            hasNewMessages: false // Novo pedido começa sem novas mensagens
        };

        mockShipments.push(newOrder);
        localStorage.setItem('mockShipments', JSON.stringify(mockShipments));
        alert('Novo pedido adicionado com sucesso!');
        addOrderForm.reset();
        renderShipments();
        showSection(activeShipmentsSection);
        updateNavActiveState('active-shipments-section');
    };

    const handleSaveFreightValues = (shipmentId) => {
        // console.log('handleSaveFreightValues: Salvando valores de frete para o pedido:', shipmentId);
        const shipmentIndex = mockShipments.findIndex(s => s.id === shipmentId);
        if (shipmentIndex === -1) return;

        const inputFreight = document.getElementById(`input-freight-${shipmentId}`);
        const inputOrder = document.getElementById(`input-order-${shipmentId}`);

        const freightValue = parseFloat(inputFreight.value);
        const orderValue = parseFloat(inputOrder.value);

        if (isNaN(freightValue) || isNaN(orderValue) || orderValue <= 0) {
            alert('Por favor, insira valores válidos para o frete e o valor total do pedido.');
            return;
        }

        const percentage = (freightValue / orderValue) * 100;

        if (confirm(`Deseja salvar os valores de frete (R$ ${freightValue.toFixed(2)}) e pedido (R$ ${orderValue.toFixed(2)}) para o Pedido #${shipmentId}? Percentual do frete: ${percentage.toFixed(2)}%`)) {
            mockShipments[shipmentIndex].freightValue = freightValue;
            mockShipments[shipmentIndex].orderValue = orderValue;

            mockShipments[shipmentIndex].currentChatMessages.push({
                sender: `Sistema (${currentUserRole.charAt(0).toUpperCase() + currentUserRole.slice(1)})`,
                text: `Valores de frete (R$ ${freightValue.toFixed(2)}) e pedido (R$ ${orderValue.toFixed(2)}) atualizados. Percentual do frete: ${percentage.toFixed(2)}%.`,
                time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
            });
            mockShipments[shipmentIndex].hasNewMessages = true; 

            localStorage.setItem('mockShipments', JSON.stringify(mockShipments));
            renderShipments();
            renderNotifications();
            alert('Valores de frete e pedido salvos com sucesso!');
        }
    };


    const handleUpdateStatus = (selectElement) => {
        // console.log('handleUpdateStatus: Tentando atualizar status via seletor.');
        const shipmentId = selectElement.dataset.shipmentId;
        const newStatus = selectElement.value;
        const currentStatus = selectElement.dataset.currentStatus;

        if (!newStatus) { // Se nada foi selecionado
            return;
        }

        const shipmentIndex = mockShipments.findIndex(s => s.id === shipmentId);
        if (shipmentIndex === -1) return;

        const allowedNextStates = orderStatuses[currentStatus] ? orderStatuses[currentStatus].nextStates : [];
        if (!allowedNextStates.includes(newStatus)) {
            alert(`Mudança de status inválida: Não é possível ir de "${orderStatuses[currentStatus].label}" para "${orderStatuses[newStatus].label}".`);
            selectElement.value = currentStatus; // Reverte a seleção no UI
            return;
        }

        const allowedToSetNewStatus = orderStatuses[newStatus] && orderStatuses[newStatus].allowedRolesToSet.includes(currentUserRole);

        if (!allowedToSetNewStatus && currentUserRole !== 'admin') {
            alert(`Você (${currentUserRole.charAt(0).toUpperCase() + currentUserRole.slice(1)}) não tem permissão para mudar para o status "${orderStatuses[newStatus].label}".`);
            selectElement.value = currentStatus; // Reverte a seleção no UI
            return;
        }

        // Regra específica para Logística
        if (currentUserRole === 'logistica' && (newStatus === 'coletado' || newStatus === 'em_transito') && (mockShipments[shipmentIndex].freightValue === null || mockShipments[shipmentIndex].orderValue === null)) {
            alert('Para prosseguir com este status, os valores de frete e pedido devem ser preenchidos pela Logística.');
            selectElement.value = currentStatus; // Reverte a seleção
            return;
        }


        if (confirm(`Deseja mudar o status do Pedido #${shipmentId} de "${orderStatuses[currentStatus].label}" para "${orderStatuses[newStatus].label}"?`)) {
            mockShipments[shipmentIndex].status = newStatus;
            mockShipments[shipmentIndex].lastStatusUpdateTime = new Date().toISOString().split('T')[0]; // Atualiza data da última mudança de status
            mockShipments[shipmentIndex].currentChatMessages.push({
                sender: `Sistema (${currentUserRole.charAt(0).toUpperCase() + currentUserRole.slice(1)})`,
                text: `Status atualizado para "${orderStatuses[newStatus].label}".`,
                time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
            });
            mockShipments[shipmentIndex].hasNewMessages = true; // Marca como nova mensagem no chat do pedido
            localStorage.setItem('mockShipments', JSON.stringify(mockShipments));
            renderShipments(); // Re-renderiza para mostrar o status atualizado
            renderNotifications(); // Atualiza as notificações
            alert(`Status do Pedido #${shipmentId} atualizado para ${orderStatuses[newStatus].label}!`);
        } else {
            selectElement.value = currentStatus; // Reverte a seleção se o usuário cancelar
        }
    };

    // --- Gerenciamento de Transportadoras (Mock) ---
    const renderTransporters = () => {
        // console.log('renderTransporters: Renderizando transportadoras.');
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

    // --- Gerenciamento de Notificações (Mock e baseadas em atraso) ---
    const renderNotifications = () => {
        // console.log('renderNotifications: Renderizando notificações.');
        const notificationsList = document.getElementById('notifications-list');
        notificationsList.innerHTML = '';

        let allNotifications = [];

        mockShipments.forEach(shipment => {
            const timeRemaining = getRemainingTime(shipment.date);
            const currentStatusInfo = orderStatuses[shipment.status];

            // Notificação de novas mensagens no chat do pedido
            if (shipment.hasNewMessages) {
                allNotifications.push({
                    id: `chat-msg-${shipment.id}`,
                    text: `Nova mensagem no chat do Pedido #${shipment.id} (${shipment.client})!`,
                    time: 'Agora!',
                    read: false,
                    roles: ['venda', 'logistica', 'financeiro', 'admin']
                });
            }

            if (currentStatusInfo && timeRemaining.late && shipment.status !== 'retirado_cliente' && shipment.status !== 'cancelled') {
                const responsible = currentStatusInfo.responsibleRole;
                if (responsible && responsible !== 'N/A') {
                    const notificationText = `ATRASO: Pedido #${shipment.id} (${shipment.client}) está atrasado no status "${currentStatusInfo.label}". Prazo de entrega: ${shipment.date}.`;
                    allNotifications.push({
                        id: `late-${shipment.id}`,
                        text: notificationText,
                        time: 'AGORA!',
                        read: false,
                        roles: [responsible, 'admin']
                    });
                }
            } else if (!timeRemaining.late && timeRemaining.days < 2 && shipment.status !== 'retirado_cliente' && shipment.status !== 'cancelled') {
                const responsible = currentStatusInfo.responsibleRole;
                if (responsible && responsible !== 'N/A') {
                    const notificationText = `ALERTA: Pedido #${shipment.id} (${shipment.client}) com prazo próximo. Status: "${currentStatusInfo.label}". Faltam ${timeRemaining.days}d ${timeRemaining.hours}h.`;
                    allNotifications.push({
                        id: `warning-${shipment.id}`,
                        text: notificationText,
                        time: 'AGORA!',
                        read: false,
                        roles: [responsible, 'admin']
                    });
                }
            }

            if (shipment.freightValue !== null && shipment.orderValue !== null && shipment.orderValue > 0) {
                const percentage = (shipment.freightValue / shipment.orderValue) * 100;
                if (percentage > 4) { // Exemplo de regra: frete acima de 4%
                    allNotifications.push({
                        id: `freight-high-${shipment.id}`,
                        text: `ALERTA: Pedido #${shipment.id} - Percentual do frete (${percentage.toFixed(2)}%) acima de 4%!`,
                        time: 'Importante!',
                        read: false,
                        roles: ['logistica', 'admin']
                    });
                }
            }
        });

        if (hasNewInternalMessages) {
             allNotifications.push({
                id: `internal-chat-msg`,
                text: `Nova mensagem no Chat Interno!`,
                time: 'Agora!',
                read: false,
                roles: ['venda', 'logistica', 'financeiro', 'admin']
            });
        }


        let filteredNotifications = allNotifications;

        if (currentUserRole && currentUserRole !== 'admin') {
             filteredNotifications = allNotifications.filter(notif => {
                return notif.roles && notif.roles.includes(currentUserRole);
            });
        }

        if (filteredNotifications.length === 0) {
            notificationsList.innerHTML = '<p>Nenhuma notificação.</p>';
            return;
        }

        // Ordena notificações para não lidas aparecerem primeiro
        filteredNotifications.sort((a, b) => (a.read === b.read) ? 0 : a.read ? 1 : -1);

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


    // --- Gerenciamento de Chat (Seções Completas) ---
    let activeChatShipmentId = null;
    let activeChatClientName = null;

    // NOVO: Função para atualizar o indicador de novas mensagens no nav item do chat
    const updateChatIndicators = () => {
        // console.log('updateChatIndicators: Atualizando indicadores de chat.');
        // Para o chat interno
        if (hasNewInternalMessages) {
            internalChatNavIndicator.classList.remove('hidden');
        } else {
            internalChatNavIndicator.classList.add('hidden');
        }

        // Poderíamos adicionar um indicador para a seção de pedidos ativos se algum tiver nova mensagem
        // const hasNewShipmentMessages = mockShipments.some(s => s.hasNewMessages);
        // if (hasNewShipmentMessages) { /* Mostra indicador no nav-item de pedidos */ }
    };


    const openChat = (shipmentId, clientName) => {
        // console.log('openChat: Abrindo chat para o pedido:', shipmentId);
        activeChatShipmentId = shipmentId;
        activeChatClientName = clientName;
        const shipment = mockShipments.find(s => s.id === shipmentId);
        if (shipment) {
            chatOrderTitle.textContent = `Conversa com ${clientName} (Pedido #${shipment.id})`;
            renderChatMessages(shipment.currentChatMessages || [], chatMessagesContainer); // Renderiza no container correto
            showSection(chatSection); // Agora o chat é uma seção
            // Não atualiza o estado de navegação inferior para "chat-section"
            // pois o chat é uma seção "modal" que cobre o dashboard principal.
            // A navegação inferior não precisa indicar o chat como "ativo".

            // Marca mensagens como lidas
            shipment.hasNewMessages = false;
            localStorage.setItem('mockShipments', JSON.stringify(mockShipments));
            renderNotifications(); // Atualiza notificações e cards de envio
            renderShipments(); // Re-renderiza cards para remover indicador de nova mensagem
        }
    };

    const closeChat = () => {
        // console.log('closeChat: Fechando chat do pedido e voltando para Envios Ativos.');
        showSection(activeShipmentsSection); // Volta para a seção de envios ativos
        updateNavActiveState('active-shipments-section'); // Reativa o item de navegação
        activeChatShipmentId = null;
        activeChatClientName = null;
        chatMessagesContainer.innerHTML = ''; // Limpa as mensagens do chat
    };

    const renderChatMessages = (messages, container) => {
        // console.log('renderChatMessages: Renderizando mensagens de chat.');
        container.innerHTML = '';
        messages.forEach(msg => {
            const messageDiv = document.createElement('div');
            // 'Você' é usado para identificar a própria mensagem
            const isSentByCurrentUser = msg.sender.includes('Você') || msg.sender === currentUserEmail; 
            const senderName = isSentByCurrentUser ? msg.sender : `${msg.sender.includes('Sistema') ? '' : msg.sender}`;

            messageDiv.classList.add('chat-message', isSentByCurrentUser ? 'sent' : 'received');

            let messageContent = `<span class="message-sender">${senderName}</span>`;
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
            container.appendChild(messageDiv);
        });
        container.scrollTop = container.scrollHeight; // Rola para o final
    };

    const handleSendMessage = () => {
        // console.log('handleSendMessage: Tentando enviar mensagem do chat do pedido.');
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
            // Em um ambiente real, você faria upload do arquivo para um servidor
            // Aqui, apenas criamos uma URL temporária para exibição
            newMessage.fileUrl = URL.createObjectURL(selectedFile);
            newMessage.fileName = selectedFile.name;
            newMessage.fileType = selectedFile.type;
        }

        mockShipments[shipmentIndex].currentChatMessages.push(newMessage);
        localStorage.setItem('mockShipments', JSON.stringify(mockShipments));

        // Não marca como hasNewMessages = true para o próprio remetente no chat do pedido
        // mockShipments[shipmentIndex].hasNewMessages = false; 
        // localStorage.setItem('mockShipments', JSON.stringify(mockShipments));

        renderChatMessages(mockShipments[shipmentIndex].currentChatMessages, chatMessagesContainer);
        chatInput.value = '';
        chatFileInput.value = ''; // Limpa o input de arquivo
        renderNotifications();
        renderShipments(); // Re-renderiza para atualizar se o indicador de "nova mensagem" sumiu
    };

    // NOVO: Funções para o Chat Interno
    const renderInternalChatMessages = () => {
        // console.log('renderInternalChatMessages: Renderizando mensagens do chat interno.');
        renderChatMessages(mockInternalChatMessages, internalChatMessagesContainer);

        hasNewInternalMessages = false; // Marca como lida ao abrir a seção
        localStorage.setItem('hasNewInternalMessages', JSON.stringify(hasNewInternalMessages));
        updateChatIndicators(); // Atualiza o indicador visual
        renderNotifications(); // Atualiza a lista de notificações
    };

    const handleSendInternalMessage = () => {
        // console.log('handleSendInternalMessage: Tentando enviar mensagem do chat interno.');
        const messageText = internalChatInput.value.trim();

        if (!messageText) {
            alert('Por favor, digite sua mensagem interna.');
            return;
        }

        const newMessage = {
            sender: `Você (${currentUserRole.charAt(0).toUpperCase() + currentUserRole.slice(1)})`,
            text: messageText,
            time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        };

        mockInternalChatMessages.push(newMessage);
        localStorage.setItem('mockInternalChatMessages', JSON.stringify(mockInternalChatMessages));

        // Não marca como hasNewInternalMessages = true ao enviar
        // hasNewInternalMessages = false; 
        // localStorage.setItem('hasNewInternalMessages', JSON.stringify(hasNewInternalMessages));

        renderInternalChatMessages(); // Re-renderiza o chat interno
        internalChatInput.value = '';
        renderNotifications();
        updateChatIndicators();
    };


    // --- Event Listeners ---

    // Navegação da página de autenticação
    showRegisterLink.addEventListener('click', (e) => { e.preventDefault(); /*console.log('showRegisterLink clicado');*/ showRegisterSection(); });
    showLoginLink.addEventListener('click', (e) => { e.preventDefault(); /*console.log('showLoginLink clicado');*/ showLoginSection(); });
    loginButton.addEventListener('click', handleLogin);
    registerButton.addEventListener('click', handleRegister);
    logoutButton.addEventListener('click', handleLogout);

    // Navegação do Dashboard
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetId = item.dataset.target;
            // console.log('Nav item clicado. Target ID:', targetId);
            showSection(document.getElementById(targetId));
            updateNavActiveState(targetId);

            // Chamadas de renderização específicas para cada seção
            if (targetId === 'active-shipments-section') renderShipments();
            else if (targetId === 'transporters-section') renderTransporters();
            else if (targetId === 'notifications-section') renderNotifications();
            else if (targetId === 'internal-chat-section') renderInternalChatMessages();
            else if (targetId === 'map-section') populateMapOrderSelect();
            // Nenhuma ação específica para 'add-order-section' além de mostrar
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

    // Eventos do Chat por Pedido
    sendChatBtn.addEventListener('click', handleSendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSendMessage();
        }
    });
    closeChatBtn.addEventListener('click', closeChat);

    // NOVO: Eventos do Chat Interno
    sendInternalChatBtn.addEventListener('click', handleSendInternalMessage);
    internalChatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSendInternalMessage();
        }
    });


    // Controles do Mapa Mock
    document.getElementById('update-location-btn').addEventListener('click', () => {
        // console.log('Botão Atualizar Localização (Mock) clicado.');
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
        // console.log('populateMapOrderSelect: Populando seletor de pedidos para o mapa.');
        const selectOrderForMap = document.getElementById('select-order-for-map');
        selectOrderForMap.innerHTML = '<option value="">Selecione um Pedido</option>';
        mockShipments.forEach(shipment => {
            const option = document.createElement('option');
            option.value = shipment.id;
            option.textContent = `Pedido #${shipment.id} - ${shipment.client}`;
            selectOrderForMap.appendChild(option);
        });
    };


    // --- Carregamento Inizial ---
    checkAuthStatus(); // Verifica o estado de autenticação ao carregar a página
});
