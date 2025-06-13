// ===== NOVAS CONSTANTES E VARIÁVEIS =====
let freteLimit = 4; // Valor padrão
const IMPOSSIBLE_DELIVERIES = [
    { origin: 'ES', destination: 'MA', minDays: 3 }
];

// ===== FUNÇÕES ADICIONADAS =====

// Função para verificar frete
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

// Função para verificar entregas impossíveis
function checkImpossibleDelivery(origin, destination, promisedDays) {
    const originState = getStateFromAddress(origin);
    const destinationState = getStateFromAddress(destination);
    
    const impossibleRoute = IMPOSSIBLE_DELIVERIES.find(route => 
        route.origin === originState && route.destination === destinationState
    );
    
    if (impossibleRoute && promisedDays < impossibleRoute.minDays) {
        return {
            impossible: true,
            minDays: impossibleRoute.minDays
        };
    }
    
    return { impossible: false };
}

function getStateFromAddress(address) {
    const stateMatch = address.match(/- ([A-Z]{2})$/);
    return stateMatch ? stateMatch[1] : '';
}

// Função para registrar ações de auditoria
function logAction(action, shipmentId = null) {
    const user = JSON.parse(localStorage.getItem('currentUser')).username;
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

// Função para renderizar logs de auditoria
function renderAuditLogs() {
    const auditLogsContainer = document.getElementById('audit-logs');
    const auditLogs = JSON.parse(localStorage.getItem('auditLogs')) || [];
    
    if (auditLogs.length === 0) {
        auditLogsContainer.innerHTML = '<p>Nenhuma ação registrada</p>';
        return;
    }
    
    auditLogsContainer.innerHTML = '';
    auditLogs.slice(0, 10).forEach(log => {
        const logElement = document.createElement('div');
        logElement.classList.add('audit-log');
        logElement.innerHTML = `
            <div class="log-header">
                <span class="user">${log.user}</span>
                <span class="timestamp">${log.timestamp}</span>
            </div>
            <div class="log-action">${log.shipmentId ? `Pedido ${log.shipmentId}: ` : ''}${log.action}</div>
        `;
        auditLogsContainer.appendChild(logElement);
    });
}

// ===== MODIFICAÇÕES NAS FUNÇÕES EXISTENTES =====

// No DOMContentLoaded, adicione:
document.addEventListener('DOMContentLoaded', () => {
    // ... código existente
    
    // Novo: Exibir perfil do usuário
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser && document.getElementById('current-role')) {
        document.getElementById('current-role').textContent = currentUser.profile;
    }
    
    // Novo: Event listeners para campos de frete
    if (document.getElementById('valor-nf') && document.getElementById('valor-frete')) {
        document.getElementById('valor-nf').addEventListener('input', checkFrete);
        document.getElementById('valor-frete').addEventListener('input', checkFrete);
    }
    
    // Novo: Aplicar limite de frete
    if (document.getElementById('apply-frete-limit')) {
        document.getElementById('apply-frete-limit').addEventListener('click', () => {
            freteLimit = parseFloat(document.getElementById('frete-limit').value) || 4;
            logAction(`Alterou limite de frete para ${freteLimit}%`);
        });
    }
    
    // Renderizar logs de auditoria
    renderAuditLogs();
});

// Modificação na função addNewShipment()
const addNewShipment = () => {
    // ... código existente
    
    // Verificação do frete
    const fretePercent = checkFrete();
    if (fretePercent > freteLimit) {
        validationMessage.textContent = `Frete excede o limite de ${freteLimit}%!`;
        validationMessage.className = 'validation-message';
        return;
    }
    
    // Verificação de entrega impossível
    const deliveryCheck = checkImpossibleDelivery(origin, destination, 1); // 1 dia é o padrão
    if (deliveryCheck.impossible) {
        validationMessage.textContent = `Entrega impossível! Mínimo ${deliveryCheck.minDays} dias para ${getStateFromAddress(origin)} → ${getStateFromAddress(destination)}`;
        validationMessage.className = 'validation-message';
        return;
    }
    
    // ... restante do código
    
    // Registrar ação
    logAction(`Criou novo pedido`, orderId);
};

// Modificação na função updateShipmentStatus()
const updateShipmentStatus = (id) => {
    // ... código existente
    
    // Registrar ação
    logAction(`Atualizou status para "${shipment.status}"`, id);
};

// No login, armazenar usuário atual
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        // ... código existente
        
        if (storedUser && storedUser.username === username && storedUser.password === password) {
            localStorage.setItem('currentUser', JSON.stringify(storedUser));
            // ... restante
        }
    });
}

// No registro, adicionar campo de perfil
if (registerForm) {
    // Adicione este campo no HTML do registro:
    // <select id="register-profile" required>...</select>
    
    registerForm.addEventListener('submit', (e) => {
        // ... código existente
        
        const profile = document.getElementById('register-profile').value;
        const newUser = { username, email, password, profile };
        
        // ... restante
    });
}
