document.addEventListener('DOMContentLoaded', () => {
    const activeShipmentsList = document.getElementById('active-shipments-list');
    const notificationsList = document.getElementById('notifications-list');
    const alertsList = document.getElementById('alerts-list');
    const transportadorasList = document.getElementById('transportadoras-list');
    const addOrderBtn = document.getElementById('add-order-btn');
    const validationMessage = document.getElementById('validation-message');
    const filterRating = document.getElementById('filter-rating');
    const chatMessagesContainer = document.getElementById('chat-messages'); // Rinominato per chiarezza
    const chatMessageInput = document.getElementById('chat-message-input');
    const sendChatMessageBtn = document.getElementById('send-chat-message-btn');
    const logoutBtn = document.getElementById('logout-btn');


    // --- Autenticazione ---
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const loginMessage = document.getElementById('login-message');
    const registerMessage = document.getElementById('register-message');

    // Funzione per controllare lo stato di autenticazione
    function checkAuth() {
        const isLoggedIn = localStorage.getItem('isLoggedIn');
        const currentPath = window.location.pathname;

        if (currentPath.endsWith('index.html') || currentPath === '/' || currentPath.endsWith('/')) {
            if (!isLoggedIn) {
                window.location.href = 'login.html'; // Reindirizza al login se non autenticato
            }
        } else if (currentPath.endsWith('login.html') || currentPath.endsWith('register.html')) {
            if (isLoggedIn) {
                window.location.href = 'index.html'; // Se già loggato, reindirizza alla dashboard
            }
        }
    }

    checkAuth(); // Esegui il controllo all'avvio su tutte le pagine


    // Gestione Form Login
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('login-username').value;
            const password = document.getElementById('login-password').value;

            const storedUser = JSON.parse(localStorage.getItem('registeredUser'));

            if (storedUser && storedUser.username === username && storedUser.password === password) {
                localStorage.setItem('isLoggedIn', 'true');
                loginMessage.textContent = 'Login avvenuto con successo!';
                loginMessage.className = 'validation-message success';
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
            } else {
                loginMessage.textContent = 'Nome utente o password non validi.';
                loginMessage.className = 'validation-message';
            }
        });
    }

    // Gestione Form Registrazione
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('register-username').value;
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;
            const confirmPassword = document.getElementById('register-confirm-password').value;

            if (password !== confirmPassword) {
                registerMessage.textContent = 'Le password non corrispondono.';
                registerMessage.className = 'validation-message';
                return;
            }

            // In una vera applicazione, qui si controllerebbe se l'username/email è già in uso nel database.
            // Per questa simulazione, permettiamo solo una registrazione alla volta.
            if (localStorage.getItem('registeredUser')) {
                registerMessage.textContent = 'Un utente è già registrato (simulazione). Accedi o cancella i dati del browser.';
                registerMessage.className = 'validation-message';
                return;
            }

            const newUser = { username, email, password };
            localStorage.setItem('registeredUser', JSON.stringify(newUser));
            registerMessage.textContent = 'Registrazione avvenuta con successo! Puoi accedere ora.';
            registerMessage.className = 'validation-message success';
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
        });
    }

    // Funzione di Logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('isLoggedIn');
            // localStorage.removeItem('registeredUser'); // Puoi rimuovere anche l'utente registrato se vuoi un reset completo ad ogni logout
            window.location.href = 'login.html';
        });
    }
    // --- Fine Autenticazione ---


    // Dummy Data (Dati di esempio - caricati solo se non loggati, altrimenti già in localStorage)
    let shipments = JSON.parse(localStorage.getItem('shipments')) || [
        { id: '12345', seller: 'Ana Lúcia', destination: 'Rua Cabo Verde 798, Rio De Janeiro - RJ', status: 'Pronto para Coleta', datePromised: '2025-06-15', currentStep: 0, history: [], notes: '', origin: 'Rua Humberto Serrano 1126, Vila Velha - ES', estimatedTime: '2-3 dias' },
        { id: '67890', seller: 'Carlos Eduardo', destination: 'Av. Paulista 1578, São Paulo - SP', status: 'Em Rota', datePromised: '2025-06-12', currentStep: 2, history: [], notes: '', origin: 'Av. Brasil 1000, Vitória - ES', estimatedTime: '1-2 dias' },
        { id: '11223', seller: 'Mariana Costa', destination: 'Praça da Liberdade 123, Belo Horizonte - MG', status: 'Entregue', datePromised: '2025-06-08', currentStep: 4, history: [], notes: '', origin: 'Rua da Praia 500, Guarapari - ES', estimatedTime: '3-4 dias' },
    ];

    let notifications = JSON.parse(localStorage.getItem('notifications')) || [
        { id: 'not1', message: 'Pedido 12345: Atraso na coleta.', type: 'alert', read: false },
        { id: 'not2', message: 'Pedido 67890: Status atualizado para "Em Rota".', type: 'info', read: false },
    ];

    let chatMessages = JSON.parse(localStorage.getItem('chatMessages')) || [
        { sender: 'Sistema', message: 'Bem-vindo ao chat interno!', timestamp: new Date('2025-06-08T10:00:00').toLocaleString() }
    ];

    let transportadoras = JSON.parse(localStorage.getItem('transportadoras')) || [
        { name: 'Transportadora A', rating: 5, deliveries: 150, onTime: 145, issues: 5 },
        { name: 'Transportadora B', rating: 4, deliveries: 120, onTime: 110, issues: 10 },
        { name: 'Transportadora C', rating: 3, deliveries: 80, onTime: 60, issues: 20 },
    ];

    // Salva i dati in localStorage
    const saveData = () => {
        localStorage.setItem('shipments', JSON.stringify(shipments));
        localStorage.setItem('notifications', JSON.stringify(notifications));
        localStorage.setItem('chatMessages', JSON.stringify(chatMessages));
        localStorage.setItem('transportadoras', JSON.stringify(transportadoras));
    };

    // Timeline Steps Configuration
    const timelineSteps = [
        { name: 'Pronto para Coleta', icon: 'fas fa-box' },
        { name: 'Coletado', icon: 'fas fa-truck-loading' },
        { name: 'Em Rota', icon: 'fas fa-truck-fast' },
        { name: 'Em Processo de Entrega', icon: 'fas fa-dolly' },
        { name: 'Entregue', icon: 'fas fa-handshake' }
    ];

    // --- Funzioni di rendering ---

    const renderTimeline = (currentStepIndex) => {
        let timelineHtml = '<div class="timeline-container">';
        timelineSteps.forEach((step, index) => {
            let statusClass = '';
            if (index < currentStepIndex) {
                statusClass = 'completed';
            } else if (index === currentStepIndex) {
                statusClass = 'current';
            }
            timelineHtml += `
                <div class="timeline-step ${statusClass}">
                    <div class="icon-wrapper"><i class="${step.icon}"></i></div>
                    <span class="label">${step.name}</span>
                </div>
            `;
        });
        timelineHtml += '</div>';
        return timelineHtml;
    };

    const renderShipments = (shipmentList) => {
        if (!activeShipmentsList) return; 
        activeShipmentsList.innerHTML = '';
        if (shipmentList.length === 0) {
            activeShipmentsList.innerHTML = '<p>Nessun pedido attivo al momento.</p>';
            return;
        }
        shipmentList.forEach(shipment => {
            const shipmentCard = document.createElement('div');
            shipmentCard.classList.add('shipment-card');
            shipmentCard.innerHTML = `
                <h3>Pedido ID: ${shipment.id}</h3>
                <p><strong>Vendedor:</strong> ${shipment.seller}</p>
                <p><strong>Origem:</strong> ${shipment.origin || 'Não informada'}</p>
                <p><strong>Destino:</strong> ${shipment.destination}</p>
                <p><strong>Status:</strong> <span class="status-${shipment.status.replace(/\s/g, '-').toLowerCase()}">${shipment.status}</span></p>
                <p><strong>Promessa de Entrega:</strong> ${shipment.datePromised}</p>
                <p><strong>Tempo Estimado:</strong> ${shipment.estimatedTime || 'Calculando...'}</p>
                ${renderTimeline(shipment.currentStep)}
                <div class="card-actions">
                    <button class="action-btn update-status-btn" data-id="${shipment.id}">Atualizar Status</button>
                    <button class="action-btn view-details-btn" data-id="${shipment.id}">Ver Detalhes</button>
                </div>
            `;
            activeShipmentsList.appendChild(shipmentCard);
        });

        document.querySelectorAll('.update-status-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = e.target.dataset.id;
                updateShipmentStatus(id);
            });
        });
    };

    const renderNotifications = (notificationList) => {
        if (!notificationsList) return;
        notificationsList.innerHTML = '';
        if (notificationList.length === 0) {
            notificationsList.innerHTML = '<p>Nessuna notifica.</p>';
            return;
        }
        notificationList.forEach(notification => {
            const notificationItem = document.createElement('div');
            notificationItem.classList.add('notification-item');
            if (notification.read) {
                notificationItem.classList.add('read');
            }
            notificationItem.innerHTML = `
                <span class="notification-type ${notification.type}"></span>
                <p>${notification.message}</p>
                <button class="mark-read-btn" data-id="${notification.id}"><i class="fas fa-check"></i></button>
            `;
            notificationsList.appendChild(notificationItem);
        });

        document.querySelectorAll('.mark-read-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = e.target.dataset.id;
                markNotificationAsRead(id);
            });
        });
    };

    const renderAlerts = (alertList) => {
        if (!alertsList) return;
        alertsList.innerHTML = '';
        if (alertList.length === 0) {
            alertsList.innerHTML = '<p>Nessun alert attivo.</p>';
            return;
        }
        alertList.forEach(alert => {
            const alertCard = document.createElement('div');
            alertCard.classList.add('alert-card');
            alertCard.innerHTML = `
                <h3>Alert ID: ${alert.id}</h3>
                <p><strong>Messaggio:</strong> ${alert.message}</p>
                <p><strong>Tipo:</strong> <span class="alert-type-${alert.type}">${alert.type}</span></p>
                ${alert.relatedShipmentId ? `<p><strong>Pedido Correlato:</strong> ${alert.relatedShipmentId}</p>` : ''}
            `;
            alertsList.appendChild(alertCard);
        });
    };

    const renderTransportadoras = (transportadoraList) => {
        if (!transportadorasList) return;
        transportadorasList.innerHTML = '';
        const filteredList = transportadoraList.filter(t => t.rating >= (filterRating ? parseInt(filterRating.value) : 0));

        if (filteredList.length === 0) {
            transportadorasList.innerHTML = '<p>Nessuna transportadora trovata con i filtri selezionati.</p>';
            return;
        }

        filteredList.forEach(t => {
            const transportadoraCard = document.createElement('div');
            transportadoraCard.classList.add('transportadora-card');
            const stars = '★'.repeat(t.rating) + '☆'.repeat(5 - t.rating);
            transportadoraCard.innerHTML = `
                <h3>${t.name}</h3>
                <p class="rating">${stars}</p>
                <p><strong>Entregas:</strong> ${t.deliveries}</p>
                <p><strong>A Tempo:</strong> ${t.onTime} (${((t.onTime / t.deliveries) * 100).toFixed(1)}%)</p>
                <p><strong>Problemas:</strong> ${t.issues}</p>
            `;
            transportadorasList.appendChild(transportadoraCard);
        });
    };

    const renderChatMessages = () => {
        if (!chatMessagesContainer) return;
        chatMessagesContainer.innerHTML = ''; // Pulisci prima di renderizzare
        chatMessages.forEach(msg => {
            const messageDiv = document.createElement('div');
            messageDiv.classList.add('chat-message', msg.sender === 'Eu' ? 'mine' : 'other');
            messageDiv.innerHTML = `
                <span class="chat-sender">${msg.sender}:</span>
                <p>${msg.message}</p>
                <span class="chat-timestamp">${msg.timestamp}</span>
            `;
            chatMessagesContainer.appendChild(messageDiv);
        });
        chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight; // Scroll to bottom
    };

    // --- Funzioni di logica ---

    const updateShipmentStatus = (id) => {
        const shipment = shipments.find(s => s.id === id);
        if (shipment) {
            const nextStepIndex = shipment.currentStep + 1;
            if (nextStepIndex < timelineSteps.length) {
                shipment.currentStep = nextStepIndex;
                shipment.status = timelineSteps[nextStepIndex].name;
                addNotification(`Pedido ${id}: Status atualizado para "${shipment.status}".`, 'info');
            } else if (nextStepIndex === timelineSteps.length) {
                shipment.currentStep = nextStepIndex; // Imposta l'ultimo stato come "completato"
                shipment.status = 'Entregue'; // Stato finale
                addNotification(`Pedido ${id}: Entregue com sucesso!`, 'success');
            } else {
                addNotification(`Pedido ${id}: Já está no status final.`, 'info');
            }
            saveData();
            renderShipments(shipments);
            renderNotifications(notifications);
        }
    };

    const addNotification = (message, type) => {
        const newNotification = {
            id: `not${Date.now()}`,
            message: message,
            type: type,
            read: false
        };
        notifications.unshift(newNotification); // Aggiungi in cima
        saveData();
        renderNotifications(notifications);
    };

    const markNotificationAsRead = (id) => {
        const notification = notifications.find(n => n.id === id);
        if (notification) {
            notification.read = true;
            saveData();
            renderNotifications(notifications);
        }
    };

    const addNewShipment = () => {
        const orderId = document.getElementById('order-id').value.trim();
        const sellerName = document.getElementById('seller-name').value.trim();
        const origin = document.getElementById('order-origin').value.trim(); // Nuovo campo origine
        const destination = document.getElementById('destination').value.trim();
        const deliveryDatePromised = document.getElementById('delivery-date-promised').value;

        // Verifica se i campi obbligatori sono compilati
        if (!orderId || !sellerName || !origin || !destination || !deliveryDatePromised) {
            validationMessage.textContent = 'Por favor, preencha todos os campos obrigatórios.';
            validationMessage.className = 'validation-message';
            return;
        }

        // Verifica se l'ID del Pedido esiste già
        if (shipments.some(s => s.id === orderId)) {
            validationMessage.textContent = 'ID do Pedido já existe. Por favor, use um ID único.';
            validationMessage.className = 'validation-message';
            return;
        }

        // Calcola il tempo stimato di consegna
        const estimatedTime = calculateEstimatedTime(origin, destination);

        const newShipment = {
            id: orderId,
            seller: sellerName,
            origin: origin, // Aggiunto al nuovo oggetto shipment
            destination: destination,
            status: timelineSteps[0].name, // Inizia sempre con il primo status
            datePromised: deliveryDatePromised,
            currentStep: 0,
            history: [],
            notes: '',
            estimatedTime: estimatedTime // Aggiunto al nuovo oggetto shipment
        };

        shipments.push(newShipment);
        saveData();
        renderShipments(shipments);
        addNotification(`Novo pedido ${orderId} adicionado por ${sellerName}.`, 'info');

        validationMessage.textContent = 'Pedido adicionado com sucesso!';
        validationMessage.className = 'validation-message success';

        // Resetta il form
        document.getElementById('order-id').value = '';
        document.getElementById('seller-name').value = '';
        document.getElementById('order-origin').value = ''; // Resetta anche l'origine
        document.getElementById('destination').value = '';
        document.getElementById('delivery-date-promised').value = '';

        // Torna alla dashboard dopo un breve ritardo
        setTimeout(() => {
            switchView('dashboard-view');
            validationMessage.textContent = ''; // Pulisci il messaggio
        }, 1500);
    };

    // Funzione per simulare il calcolo del tempo stimato (da espandere con logica reale)
    // Questa funzione dovrebbe essere migliorata con un algoritmo più complesso o integrazioni API
    function calculateEstimatedTime(origin, destination) {
        // Estrai solo il nome della città/stato per una simulazione semplificata
        const getCityState = (address) => {
            const parts = address.split('-');
            if (parts.length > 1) {
                return parts[0].trim().split(',').pop().trim() + ' - ' + parts[1].trim();
            }
            return address.trim();
        };

        const originCleaned = getCityState(origin).toLowerCase();
        const destinationCleaned = getCityState(destination).toLowerCase();

        // Simula basandosi su distanze approssimative dal contesto di Vila Velha - ES (se l'origine è simile)
        // O implementa una logica più generica se l'origine può variare ampiamente
        if (originCleaned.includes('vila velha') || originCleaned.includes('vitória') || originCleaned.includes('guarapari')) {
             if (destinationCleaned.includes('rio de janeiro') || destinationCleaned.includes('rj')) {
                return '1-2 dias';
            } else if (destinationCleaned.includes('são paulo') || destinationCleaned.includes('sp')) {
                return '2-3 dias';
            } else if (destinationCleaned.includes('minas gerais') || destinationCleaned.includes('mg') || destinationCleaned.includes('belo horizonte')) {
                return '3-4 dias';
            } else if (destinationCleaned.includes('bahia') || destinationCleaned.includes('ba') || destinationCleaned.includes('salvador')) {
                return '4-5 dias';
            } else if (destinationCleaned.includes('nordeste') || destinationCleaned.includes('ceará') || destinationCleaned.includes('ma')) {
                return '5-7 dias';
            } else if (destinationCleaned.includes('sul') || destinationCleaned.includes('pr') || destinationCleaned.includes('sc') || destinationCleaned.includes('rs')) {
                return '4-6 dias';
            }
        }

        // Default o per origini/destinazioni non mappate
        return '3-6 dias';
    }


    // Funzione per inviare messaggi in chat
    const sendChatMessage = () => {
        const messageText = chatMessageInput.value.trim();
        if (messageText) {
            const newMessage = {
                sender: 'Eu', // Qui andrebbe il nome utente autenticato
                message: messageText,
                timestamp: new Date().toLocaleString()
            };
            chatMessages.push(newMessage);
            saveData();
            renderChatMessages();
            chatMessageInput.value = ''; // Pulisci l'input
            chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight; // Scroll to bottom
        }
    };


    // --- Gestione della Navigazione ---
    const navItems = document.querySelectorAll('.nav-item');
    const views = document.querySelectorAll('section[id$="-view"]');

    const switchView = (targetId) => {
        views.forEach(view => {
            view.classList.remove('active-view');
            view.classList.add('hidden-view');
        });
        document.getElementById(targetId).classList.remove('hidden-view');
        document.getElementById(targetId).classList.add('active-view');

        navItems.forEach(item => {
            item.classList.remove('active');
        });
        // Solo se l'elemento esiste (non nelle pagine login/register)
        const activeNavItem = document.querySelector(`.nav-item[data-target="${targetId}"]`);
        if (activeNavItem) {
            activeNavItem.classList.add('active');
        }

        // Re-renderizza la vista corrente ogni volta che si cambia
        if (targetId === 'dashboard-view') {
            renderShipments(shipments);
            renderNotifications(notifications);
        } else if (targetId === 'alerts-view') {
            const alerts = notifications.filter(n => n.type === 'alert');
            renderAlerts(alerts);
        } else if (targetId === 'evaluations-view') {
            renderTransportadoras(transportadoras);
        } else if (targetId === 'chat-view') {
            renderChatMessages();
        }
    };

    // Event Listeners (Solo se gli elementi esistono per evitare errori nelle pagine login/register)
    // Questo blocco si esegue solo se siamo nella pagina index.html (o equivalente)
    if (navItems.length > 0) { 
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                switchView(e.currentTarget.dataset.target);
            });
        });

        if (addOrderBtn) {
            addOrderBtn.addEventListener('click', addNewShipment);
        }

        if (filterRating) {
            filterRating.addEventListener('change', () => renderTransportadoras(transportadoras));
        }

        if (sendChatMessageBtn) {
            sendChatMessageBtn.addEventListener('click', sendChatMessage);
        }

        if (chatMessageInput) {
            chatMessageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    sendChatMessage();
                }
            });
        }

        // Inizializzazione della dashboard all'avvio solo se siamo in index.html
        if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
            renderShipments(shipments);
            renderNotifications(notifications);
            const alerts = notifications.filter(n => n.type === 'alert');
            renderAlerts(alerts);
            renderTransportadoras(transportadoras);
            renderChatMessages();
        }
    }
});