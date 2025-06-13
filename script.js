document.addEventListener('DOMContentLoaded', () => {
    // ===== CONSTANTES E VARIÁVEIS ADICIONADAS =====
    let freteLimit = 4;
    const IMPOSSIBLE_DELIVERIES = [
        { origin: 'ES', destination: 'MA', minDays: 3 }
    ];
    
    // ===== FUNÇÕES ADICIONADAS =====
    function checkFrete() {
        const valorNF = parseFloat(document.getElementById('valor-nf').value) || 0;
        const valorFrete = parseFloat(document.getElementById('valor-frete').value) || 0;
        
        if (valorNF <= 0) return 0;
        
        const percentual = (valorFrete / valorNF) * 100;
        const display = document.getElementById('frete-percent-display');
        const valueSpan = document.getElementById('frete-percent-value');
        
        valueSpan.textContent = `${percentual.toFixed(2)}%`;
        
        if (percentual <= freteLimit) {
            display.className = 'frete-display frete-ok';
        } else if (percentual <= freteLimit * 1.5) {
            display.className = 'frete-display frete-alerta';
        } else {
            display.className = 'frete-display frete-perigo';
        }
        
        return percentual;
    }

    function getStateFromAddress(address) {
        const stateMatch = address.match(/- ([A-Z]{2})$/);
        return stateMatch ? stateMatch[1] : '';
    }

    function checkImpossibleDelivery(origin, destination) {
        const originState = getStateFromAddress(origin);
        const destinationState = getStateFromAddress(destination);
        
        return IMPOSSIBLE_DELIVERIES.find(route => 
            route.origin === originState && 
            route.destination === destinationState
        );
    }

    function logAction(action, shipmentId = null) {
        const user = JSON.parse(localStorage.getItem('currentUser'))?.username || "Sistema";
        const timestamp = new Date().toLocaleString();
        
        const newLog = {
            user,
            action,
            timestamp,
            shipmentId
        };
        
        const auditLogs = JSON.parse(localStorage.getItem('auditLogs')) || [];
        auditLogs.unshift(newLog);
        localStorage.setItem('auditLogs', JSON.stringify(auditLogs));
        
        renderAuditLogs();
    }

    function renderAuditLogs() {
        const container = document.getElementById('audit-logs');
        const logs = JSON.parse(localStorage.getItem('auditLogs')) || [];
        
        container.innerHTML = '';
        
        if (logs.length === 0) {
            container.innerHTML = '<p>Nenhuma ação registrada</p>';
            return;
        }
        
        logs.slice(0, 10).forEach(log => {
            const logEl = document.createElement('div');
            logEl.className = 'audit-log';
            logEl.innerHTML = `
                <div class="log-header">
                    <span class="user">${log.user}</span>
                    <span class="timestamp">${log.timestamp}</span>
                </div>
                <div>${log.shipmentId ? `Pedido ${log.shipmentId}: ` : ''}${log.action}</div>
            `;
            container.appendChild(logEl);
        });
    }

    // ==== SEU CÓDIGO ORIGINAL ABAIXO (COM PEQUENAS ADIÇÕES) ====
    const activeShipmentsList = document.getElementById('active-shipments-list');
    // ... demais variáveis originais ...

    // --- Autenticazione ---
    const loginForm = document.getElementById('login-form');
    // ... código original de autenticação ...

    // Adição no loginForm
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            // ... código original ...
            if (storedUser && storedUser.username === username && storedUser.password === password) {
                localStorage.setItem('currentUser', JSON.stringify(storedUser));
                // ... resto do código ...
            }
        });
    }

    // Adição no registerForm
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            // ... código original ...
            const profile = document.getElementById('register-profile').value;
            const newUser = { username, email, password, profile };
            // ... resto do código ...
        });
    }

    // Modificação na função addNewShipment
    const addNewShipment = () => {
        // ... variáveis originais ...
        const valorFrete = parseFloat(document.getElementById('valor-frete').value) || 0;
        const valorNF = parseFloat(document.getElementById('valor-nf').value) || 0;

        // Verificação do frete
        const fretePercent = (valorFrete / valorNF) * 100;
        if (fretePercent > freteLimit) {
            validationMessage.textContent = `Frete excede o limite de ${freteLimit}%!`;
            validationMessage.className = 'validation-message';
            return;
        }

        // Verificação de entrega impossível
        const impossibleRoute = checkImpossibleDelivery(origin, destination);
        if (impossibleRoute) {
            validationMessage.textContent = `Entrega impossível! Mínimo ${impossibleRoute.minDays} dias para ${getStateFromAddress(origin)} → ${getStateFromAddress(destination)}`;
            validationMessage.className = 'validation-message';
            return;
        }

        // ... resto do código original para criar pedido ...
        
        // Registrar ação de auditoria
        logAction(`Criou novo pedido`, orderId);
    };

    // Modificação na função updateShipmentStatus
    const updateShipmentStatus = (id) => {
        // ... código original ...
        logAction(`Atualizou status para "${shipment.status}"`, id);
    };

    // No final do DOMContentLoaded
    // Eventos para campos de frete
    if (document.getElementById('valor-nf') && document.getElementById('valor-frete')) {
        document.getElementById('valor-nf').addEventListener('input', checkFrete);
        document.getElementById('valor-frete').addEventListener('input', checkFrete);
    }

    // Evento para aplicar limite de frete
    if (document.getElementById('apply-frete-limit')) {
        document.getElementById('apply-frete-limit').addEventListener('click', () => {
            freteLimit = parseFloat(document.getElementById('frete-limit').value) || 4;
            logAction(`Alterou limite de frete para ${freteLimit}%`);
        });
    }

    // Exibir perfil do usuário
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser && document.getElementById('current-role')) {
        document.getElementById('current-role').textContent = currentUser.profile;
    }

    // Renderizar auditoria inicial
    renderAuditLogs();

    // ... resto do seu código original ...
});
