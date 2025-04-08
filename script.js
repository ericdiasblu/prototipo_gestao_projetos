document.addEventListener('DOMContentLoaded', () => {
    const loginScreen = document.getElementById('login-screen');
    const mainAppScreen = document.getElementById('main-app');
    const faultReportScreen = document.getElementById('fault-report-screen'); // <<< NOVO
    const loginForm = document.getElementById('login-form');
    const logoutBtn = document.getElementById('logout-btn');
    const notificationArea = document.getElementById('notification-area');

    const screens = document.querySelectorAll('.screen');
    const contentSections = document.querySelectorAll('.main-content .content-section');
    const navButtons = document.querySelectorAll('.sidebar .nav-btn');
    const backButtons = document.querySelectorAll('.back-to-dashboard');

    // --- Estruturas de Dados ---
    let demands = [
        { id: 1, description: "Computador Lento Lab 101", priority: "Média", requestDate: "2024-07-14", dueDate: "", status: "Aberto", assignedTech: null, actions: "", reporter: null, reportedEquipment: null, environmentId: 1 },
        { id: 2, description: "Impressora Bloco B não imprime", priority: "Alta", requestDate: "2024-07-15", dueDate: "2024-07-16", status: "Em Andamento", assignedTech: "Silva", actions: "Verificado toner e conexão. Aguardando peça.", reporter: null, reportedEquipment: null, environmentId: 2 }
    ];
    let history = [
        { id: 101, completedDate: "2024-07-12", tech: "João", originalDemandId: 0, description: "Troca de HD SSD no PC da Secretaria", status: "Concluído" }
    ];
    let stock = [
        { id: 1, name: "Teclado USB ABNT2", quantity: 15, minQuantity: 5 },
        { id: 2, name: "Mouse USB", quantity: 3, minQuantity: 5 },
        { id: 3, name: "Cabo de Rede (Metro)", quantity: 50, minQuantity: 20 },
        { id: 4, name: "Toner Impressora HP XYZ", quantity: 1, minQuantity: 2 }
    ];
    // █████████ ESTRUTURA MODIFICADA █████████
    let environments = [
        { id: 1, name: "Laboratório de Informática 1", location: "Bloco C, Sala 201", equipment: "15 PCs Dell\n1 Projetor", responsibilities: [{ time: "Manhã (8h-12h)", name: "Prof. Carlos" }, { time: "Tarde (13h-17h)", name: "Tec. Ana" }] },
        { id: 2, name: "Secretaria Acadêmica", location: "Bloco A, Térreo", equipment: "3 PCs\n2 Impressoras", responsibilities: [{ time: "Integral (8h-17h)", name: "Maria Silva" }] }
    ];
    // █████████ FIM ESTRUTURA MODIFICADA █████████
    let nextDemandId = 3;
    let nextHistoryId = 102;
    let nextStockId = 5;
    let nextEnvironmentId = 3;

    let currentTechnician = "Admin";

    // --- Funções de Controle de Tela ---
    function showScreen(screenToShowId) {
        screens.forEach(screen => {
            screen.classList.toggle('active', screen.id === screenToShowId);
        });
    }

    function showContentSection(sectionToShowId) {
        contentSections.forEach(section => {
            section.classList.toggle('active', section.id === sectionToShowId);
        });
        navButtons.forEach(button => {
            button.classList.toggle('active-nav', button.dataset.target === sectionToShowId);
        });
        if (sectionToShowId !== 'demand-list-screen') {
             document.getElementById('demand-details-section').style.display = 'none';
        }
    }

    // --- Funções de Renderização ---
    function renderDemandsTable() {
        const tableBody = document.getElementById('demand-list-table-body');
        const openDemandsList = document.getElementById('dashboard-open-demands');
        tableBody.innerHTML = '';
        openDemandsList.innerHTML = '';
        let openCount = 0;
        let progressCount = 0;
        let completedCount = 0;

        // Filtrar chamados abertos ou em andamento para o dashboard
        const openOrProgressDemands = demands.filter(d => d.status === 'Aberto' || d.status === 'Em Andamento');
        if (openOrProgressDemands.length === 0) {
             openDemandsList.innerHTML = '<li>Nenhum chamado ativo.</li>';
        } else {
             openOrProgressDemands.sort((a, b) => new Date(a.requestDate) - new Date(b.requestDate)).forEach(demand => { // Ordenar por data
                 const li = document.createElement('li');
                 li.innerHTML = `#${demand.id}: ${demand.description.substring(0, 35)}... (<span class="status-${demand.status.toLowerCase().replace(' ', '-')}">${demand.status}</span>)`;
                 openDemandsList.appendChild(li);
             });
        }

        // Ordenar todos os chamados para a tabela (mais recentes primeiro)
        const sortedDemands = [...demands].sort((a,b) => b.id - a.id);

        sortedDemands.forEach(demand => {
            const row = tableBody.insertRow();
            row.innerHTML = `
                <td>${demand.id}</td>
                <td>${demand.description} ${demand.reporter ? `<small>(Reportado por: ${demand.reporter})</small>` : ''}</td>
                <td><span class="priority-${demand.priority.toLowerCase()}">${demand.priority}</span></td>
                <td>${formatDate(demand.requestDate)}</td>
                <td><span class="status-${demand.status.toLowerCase().replace(' ', '-')}">${demand.status}</span></td>
                <td class="action-buttons">
                    <button class="btn btn-sm btn-secondary view-demand-btn" data-id="${demand.id}">Ver/Atender</button>
                    ${demand.status === 'Aberto' ? `<button class="btn btn-sm btn-danger delete-demand-btn" data-id="${demand.id}">Excluir</button>` : ''}
                </td>
            `;
            if (demand.status === 'Aberto') openCount++;
            else if (demand.status === 'Em Andamento') progressCount++;
            else if (demand.status === 'Concluído') completedCount++;
        });

        document.getElementById('dashboard-demand-status').textContent = `Abertos: ${openCount} | Em Andamento: ${progressCount} | Concluídos: ${completedCount}`;
    }

    function renderHistoryTable() {
        const tableBody = document.getElementById('history-table-body');
        tableBody.innerHTML = '';
         const sortedHistory = [...history].sort((a, b) => new Date(b.completedDate) - new Date(a.completedDate));

        sortedHistory.forEach(record => {
            const row = tableBody.insertRow();
            row.innerHTML = `
                <td>${formatDate(record.completedDate)}</td>
                <td>${record.tech}</td>
                <td>${record.originalDemandId || 'N/A'}</td>
                <td>${record.description}</td>
                <td><span class="status-concluído">${record.status}</span></td>
            `;
        });

        const recentActivitiesList = document.getElementById('dashboard-recent-activities');
        recentActivitiesList.innerHTML = '';
        sortedHistory.slice(0, 3).forEach(record => {
            const li = document.createElement('li');
            li.textContent = `${formatDate(record.completedDate)} - ${record.tech}: ${record.description.substring(0, 40)}...`;
            recentActivitiesList.appendChild(li);
        });
        if (sortedHistory.length === 0) {
            recentActivitiesList.innerHTML = '<li>Nenhuma atividade registrada.</li>';
        }
    }

    function renderStockTable() {
        const tableBody = document.getElementById('stock-table-body');
        tableBody.innerHTML = '';
        let criticalItems = [];

        stock.forEach(item => {
            const isLow = item.quantity < item.minQuantity;
            if (isLow) criticalItems.push(`${item.name} (${item.quantity})`);

            const row = tableBody.insertRow();
            row.innerHTML = `
                <td>${item.name} ${isLow ? '<span class="warning">(Baixo!)</span>' : ''}</td>
                <td>${item.quantity}</td>
                <td>${item.minQuantity}</td>
                <td class="action-buttons">
                     <button class="btn btn-sm stock-action-btn" data-id="${item.id}" data-action="add">Entrada</button>
                     <button class="btn btn-sm stock-action-btn" data-id="${item.id}" data-action="remove" ${item.quantity <= 0 ? 'disabled' : ''}>Saída</button>
                     <button class="btn btn-sm btn-danger delete-stock-btn" data-id="${item.id}">Excluir</button>
                </td>
            `;
        });

        const alertsList = document.getElementById('dashboard-alerts');
        alertsList.innerHTML = '';
        criticalItems.forEach(alertText => {
            const li = document.createElement('li');
            li.innerHTML = `<span class="warning">Estoque Baixo: ${alertText}</span>`;
            alertsList.appendChild(li);
        });
         if(alertsList.innerHTML === '') {
              alertsList.innerHTML = '<li>Nenhum alerta no momento.</li>';
         }
    }

    // █████████ FUNÇÃO MODIFICADA █████████
    function renderEnvironmentsTable() {
        const tableBody = document.getElementById('environments-table-body');
        tableBody.innerHTML = '';
        environments.forEach(env => {
            const row = tableBody.insertRow();
            // Formata a exibição dos responsáveis
            let responsibilitiesText = env.responsibilities && env.responsibilities.length > 0
                ? env.responsibilities.map(r => `${r.time}: ${r.name}`).join('<br>') // Usa <br> para quebra de linha
                : 'Nenhum';

            row.innerHTML = `
                <td>${env.name}</td>
                <td>${env.location}</td>
                <td>${responsibilitiesText}</td>
                <td class="action-buttons">
                    <button class="btn btn-sm edit-env-btn" data-id="${env.id}">Editar</button>
                    <button class="btn btn-sm btn-danger delete-env-btn" data-id="${env.id}">Excluir</button>
                </td>
            `;
        });
    }
    // █████████ FIM FUNÇÃO MODIFICADA █████████

    // --- Funções Auxiliares ---
    function showNotification(message, duration = 3000, area = notificationArea) {
        area.textContent = message;
        area.style.display = 'block'; // Garante visibilidade
        area.classList.add('show');
        setTimeout(() => {
            area.classList.remove('show');
             // Esconde novamente após a animação
             setTimeout(() => { area.style.display = 'none'; }, 500);
        }, duration);
    }

     function formatDate(dateString) {
        if (!dateString) return 'N/A';
        // Ajuste para tratar data YYYY-MM-DD corretamente independente do fuso
        const parts = dateString.split('-');
        if (parts.length === 3) {
             const date = new Date(parts[0], parts[1] - 1, parts[2]);
             return date.toLocaleDateString('pt-BR');
        }
        return dateString; // Retorna original se não estiver no formato esperado
    }

    function getTodayDateString() {
         const today = new Date();
         const year = today.getFullYear();
         const month = String(today.getMonth() + 1).padStart(2, '0');
         const day = String(today.getDate()).padStart(2, '0');
         return `${year}-${month}-${day}`;
    }

    // --- Lógica de Login/Logout e Navegação ---
    if (loginForm) {
        loginForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const username = document.getElementById('username').value;
            console.log('Login com:', username);
            currentTechnician = username; // Define o técnico logado
            showScreen('main-app');
            showContentSection('dashboard-screen');
            renderAllTables(); // Renderiza todas as tabelas após login
            showNotification(`Bem-vindo, ${currentTechnician}!`);
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            console.log('Logout...');
            currentTechnician = null;
            showScreen('login-screen');
        });
    }

    // Navegação principal
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetSectionId = button.dataset.target;
            if (targetSectionId) {
                showContentSection(targetSectionId);
            }
        });
    });
    // Botões "Voltar"
    backButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetSectionId = button.dataset.target;
             if (targetSectionId) {
                showContentSection(targetSectionId);
            }
        });
    });

    // --- Lógica de Chamados (Demands) ---
    const demandForm = document.getElementById('demand-form');
    if (demandForm) {
        document.getElementById('demand-date').value = getTodayDateString();

        demandForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const newDemand = {
                id: nextDemandId++,
                description: document.getElementById('demand-description').value,
                priority: document.getElementById('demand-priority').value,
                requestDate: document.getElementById('demand-date').value,
                dueDate: document.getElementById('demand-due-date').value || null,
                status: "Aberto",
                assignedTech: null,
                actions: "",
                reporter: currentTechnician, // Quem registrou
                reportedEquipment: null, // Não vem deste form
                environmentId: null // Poderia ter um select aqui também
            };
            demands.push(newDemand);
            renderDemandsTable();
            demandForm.reset();
            document.getElementById('demand-date').value = getTodayDateString();
            showNotification("Demanda registrada com sucesso!");
            showContentSection('demand-list-screen'); // Vai para a lista após registrar
        });
    }

     // Lógica para Ver/Atender/Concluir/Excluir chamado na lista
     const demandListTableBody = document.getElementById('demand-list-table-body');
     const demandDetailsSection = document.getElementById('demand-details-section');
     let selectedDemandId = null;

     if (demandListTableBody) {
         demandListTableBody.addEventListener('click', (e) => {
             const target = e.target;
             if (target.classList.contains('view-demand-btn')) {
                 selectedDemandId = parseInt(target.dataset.id);
                 const demand = demands.find(d => d.id === selectedDemandId);
                 if (demand) {
                     document.getElementById('details-demand-id').textContent = demand.id;
                     document.getElementById('details-demand-description').textContent = demand.description;
                     document.getElementById('details-demand-priority').textContent = demand.priority;
                     document.getElementById('details-demand-status').textContent = demand.status;
                     document.getElementById('demand-actions-performed').value = demand.actions || '';

                     const completeBtn = document.getElementById('complete-demand-btn');
                     const startBtn = document.getElementById('start-demand-btn');
                     const actionsTextarea = document.getElementById('demand-actions-performed');

                     // Controla visibilidade e edição baseado no status
                     completeBtn.style.display = (demand.status === 'Em Andamento') ? 'inline-block' : 'none';
                     startBtn.style.display = (demand.status === 'Aberto') ? 'inline-block' : 'none';
                     actionsTextarea.readOnly = !(demand.status === 'Em Andamento');

                     demandDetailsSection.style.display = 'block'; // Mostra a seção de detalhes
                     demandDetailsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                 }
             } else if (target.classList.contains('delete-demand-btn')) {
                  const demandIdToDelete = parseInt(target.dataset.id);
                   if (confirm(`Tem certeza que deseja excluir a Demanda #${demandIdToDelete}? Esta ação não pode ser desfeita.`)) {
                        demands = demands.filter(d => d.id !== demandIdToDelete);
                        renderDemandsTable(); // Atualiza a tabela
                        demandDetailsSection.style.display = 'none'; // Esconde detalhes se o excluído estava selecionado
                        showNotification(`Demanda #${demandIdToDelete} excluída.`);
                   }
             }
         });
     }

     // Botão Iniciar Atendimento
     const startDemandBtn = document.getElementById('start-demand-btn');
     if(startDemandBtn) {
         startDemandBtn.addEventListener('click', () => {
             if (selectedDemandId) {
                 const demandIndex = demands.findIndex(d => d.id === selectedDemandId);
                 if (demandIndex > -1 && demands[demandIndex].status === 'Aberto') {
                     demands[demandIndex].status = 'Em Andamento';
                     demands[demandIndex].assignedTech = currentTechnician; // Associa o técnico logado
                     renderDemandsTable(); // Atualiza a lista e o dashboard
                     // Atualiza a seção de detalhes se estiver visível
                     document.getElementById('details-demand-status').textContent = 'Em Andamento';
                     document.getElementById('start-demand-btn').style.display = 'none';
                     document.getElementById('complete-demand-btn').style.display = 'inline-block';
                     document.getElementById('demand-actions-performed').readOnly = false;
                     showNotification(`Atendimento da Demanda #${selectedDemandId} iniciado por ${currentTechnician}.`);
                 }
             }
         });
     }

    // Botão Marcar como Concluído
    const completeDemandBtn = document.getElementById('complete-demand-btn');
    if (completeDemandBtn) {
        completeDemandBtn.addEventListener('click', () => {
            if (selectedDemandId) {
                const actions = document.getElementById('demand-actions-performed').value.trim();
                 if (!actions) {
                    alert("Por favor, descreva as ações realizadas para concluir a demanda.");
                    return;
                 }

                const demandIndex = demands.findIndex(d => d.id === selectedDemandId);
                if (demandIndex > -1 && demands[demandIndex].status === 'Em Andamento') {
                    const completedDemand = demands[demandIndex];
                    completedDemand.status = 'Concluído';
                    completedDemand.actions = actions;

                    // Cria registro no histórico
                    const historyRecord = {
                        id: nextHistoryId++,
                        completedDate: getTodayDateString(),
                        tech: completedDemand.assignedTech || currentTechnician, // Usa quem atendeu ou o atual
                        originalDemandId: completedDemand.id,
                        description: actions, // Descrição do que foi feito
                        status: "Concluído"
                    };
                    history.push(historyRecord);

                    // Atualiza as visualizações
                    renderDemandsTable();
                    renderHistoryTable();
                    demandDetailsSection.style.display = 'none'; // Esconde detalhes
                    showNotification(`Demanda #${selectedDemandId} concluída e registrada no histórico.`);
                }
            }
        });
    }

    // --- Lógica de Estoque ---
    const addStockForm = document.getElementById('add-stock-item-form');
    if (addStockForm) {
        addStockForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const nameInput = document.getElementById('stock-item-name');
            const qtyInput = document.getElementById('stock-item-qty');
            const minQtyInput = document.getElementById('stock-item-min-qty');
            const newItem = {
                id: nextStockId++,
                name: nameInput.value.trim(),
                quantity: parseInt(qtyInput.value) || 0,
                minQuantity: parseInt(minQtyInput.value) || 0
            };
             if (!newItem.name) {
                 alert("O nome do item é obrigatório.");
                 return;
             }
            stock.push(newItem);
            renderStockTable();
            addStockForm.reset(); // Limpa o formulário
            showNotification(`Item "${newItem.name}" adicionado ao estoque.`);
        });
    }

     // Lógica de Entrada/Saída/Exclusão de Estoque
     const stockTableBody = document.getElementById('stock-table-body');
     if (stockTableBody) {
         stockTableBody.addEventListener('click', (e) => {
             const target = e.target;
             const itemId = parseInt(target.dataset.id);
             const itemIndex = stock.findIndex(item => item.id === itemId);

             if (itemIndex === -1) return; // Sai se não encontrou o item

             if (target.classList.contains('stock-action-btn')) {
                 const action = target.dataset.action;
                 let quantityChange = 0;
                 let promptMessage = "";

                 if (action === 'add') {
                     promptMessage = `Quantidade a ADICIONAR para "${stock[itemIndex].name}":`;
                     quantityChange = parseInt(prompt(promptMessage, "1")) || 0;
                     if (quantityChange > 0) {
                         stock[itemIndex].quantity += quantityChange;
                         showNotification(`${quantityChange} unidade(s) de "${stock[itemIndex].name}" adicionada(s). Estoque atual: ${stock[itemIndex].quantity}.`);
                     } else if (quantityChange < 0) {
                         alert("Use o botão 'Saída' para remover itens.");
                         quantityChange = 0; // Reseta para não renderizar à toa
                     }
                 } else if (action === 'remove') {
                     promptMessage = `Quantidade a REMOVER de "${stock[itemIndex].name}" (atual: ${stock[itemIndex].quantity}):`;
                     quantityChange = parseInt(prompt(promptMessage, "1")) || 0;
                     if (quantityChange > 0) {
                         if (quantityChange <= stock[itemIndex].quantity) {
                             stock[itemIndex].quantity -= quantityChange;
                             showNotification(`${quantityChange} unidade(s) de "${stock[itemIndex].name}" removida(s). Estoque atual: ${stock[itemIndex].quantity}.`);
                         } else {
                             alert("Quantidade a remover maior que o estoque atual!");
                             quantityChange = 0; // Reseta
                         }
                     } else if (quantityChange < 0) {
                         alert("A quantidade a remover deve ser positiva.");
                          quantityChange = 0; // Reseta
                     }
                 }
                 if (quantityChange !== 0) renderStockTable(); // Re-renderiza a tabela se houve mudança

             } else if (target.classList.contains('delete-stock-btn')) {
                 if (confirm(`Tem certeza que deseja excluir o item "${stock[itemIndex].name}" do estoque?`)) {
                     const deletedItemName = stock[itemIndex].name;
                     stock.splice(itemIndex, 1); // Remove o item do array
                     renderStockTable(); // Atualiza a tabela
                     showNotification(`Item "${deletedItemName}" excluído.`);
                 }
             }
         });
     }

    // --- Lógica de Ambientes (Environments) ---
    // █████████ SEÇÃO MODIFICADA/ADICIONADA █████████
    const environmentForm = document.getElementById('environment-form');
    const cancelEditEnvBtn = document.getElementById('cancel-edit-env-btn');
    const responsibilitiesListDiv = document.getElementById('responsibilities-list');
    const addResponsibilityBtn = document.getElementById('add-responsibility-btn');

    // Função para adicionar um novo par de inputs para responsável
    function addResponsibilityInput(time = "", name = "") {
        const div = document.createElement('div');
        div.classList.add('responsibility-entry');
        div.style.display = 'flex';
        div.style.gap = '10px';
        div.style.marginBottom = '5px';
        div.innerHTML = `
            <input type="text" class="env-resp-time" placeholder="Horário/Turno (Ex: Manhã)" value="${time}" style="flex: 1;">
            <input type="text" class="env-resp-name" placeholder="Nome do Responsável" value="${name}" style="flex: 2;">
            <button type="button" class="btn btn-sm btn-danger remove-responsibility-btn">X</button>
        `;
        responsibilitiesListDiv.appendChild(div);

        // Adiciona listener para o botão de remover desta linha específica
        div.querySelector('.remove-responsibility-btn').addEventListener('click', () => {
            div.remove();
        });
    }

    // Adiciona um campo inicial vazio ao carregar a página ou limpar o form
    function resetResponsibilityInputs() {
        responsibilitiesListDiv.innerHTML = '';
        addResponsibilityInput(); // Adiciona o primeiro campo vazio
    }

    // Listener para o botão "+ Adicionar Responsável"
    if (addResponsibilityBtn) {
        addResponsibilityBtn.addEventListener('click', () => {
            addResponsibilityInput(); // Adiciona um novo par de campos vazios
        });
    }

    // Listener para o formulário de ambientes
    if (environmentForm) {
        environmentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const editId = parseInt(document.getElementById('env-edit-id').value);

            // Coleta os responsáveis da lista dinâmica
            const responsibilities = [];
            const entries = responsibilitiesListDiv.querySelectorAll('.responsibility-entry');
            entries.forEach(entry => {
                const timeInput = entry.querySelector('.env-resp-time');
                const nameInput = entry.querySelector('.env-resp-name');
                 // Só adiciona se ambos os campos tiverem algum valor
                 if (timeInput.value.trim() || nameInput.value.trim()) {
                    responsibilities.push({
                        time: timeInput.value.trim(),
                        name: nameInput.value.trim()
                    });
                 }
            });

            const envData = {
                name: document.getElementById('env-name').value.trim(),
                location: document.getElementById('env-location').value.trim(),
                equipment: document.getElementById('env-equipment').value.trim(),
                responsibilities: responsibilities // Array de responsáveis
            };

            if (!envData.name) {
                alert("O nome do ambiente é obrigatório.");
                return;
            }

            if (editId) { // Editando
                const index = environments.findIndex(env => env.id === editId);
                if (index > -1) {
                    environments[index] = { ...environments[index], ...envData }; // Atualiza o objeto existente
                    showNotification(`Ambiente "${envData.name}" atualizado.`);
                }
            } else { // Adicionando novo
                envData.id = nextEnvironmentId++;
                environments.push(envData);
                showNotification(`Ambiente "${envData.name}" adicionado.`);
            }

            renderEnvironmentsTable(); // Atualiza a tabela
            environmentForm.reset(); // Limpa campos básicos do form
            document.getElementById('env-edit-id').value = ''; // Limpa ID de edição
            resetResponsibilityInputs(); // Limpa e adiciona um campo de responsável vazio
            cancelEditEnvBtn.style.display = 'none'; // Esconde botão de cancelar edição
        });
    }

     // Botão Cancelar Edição de Ambiente
     if(cancelEditEnvBtn) {
         cancelEditEnvBtn.addEventListener('click', () => {
             environmentForm.reset();
             document.getElementById('env-edit-id').value = '';
             resetResponsibilityInputs();
             cancelEditEnvBtn.style.display = 'none';
         });
     }

     // Tabela de Ambientes - Botões Editar/Excluir
     const environmentsTableBody = document.getElementById('environments-table-body');
     if (environmentsTableBody) {
         environmentsTableBody.addEventListener('click', (e) => {
              const target = e.target;
              // Verifica se o clique foi em um botão dentro da célula de ações
              if (!target.closest('.action-buttons')) return;

              const button = target.closest('button'); // Pega o botão clicado
              if (!button) return;

              const envId = parseInt(button.dataset.id);
              const envIndex = environments.findIndex(env => env.id === envId);

              if (envIndex === -1) return; // Ambiente não encontrado

              if (button.classList.contains('edit-env-btn')) {
                  const env = environments[envIndex];
                  // Preenche os campos básicos
                  document.getElementById('env-edit-id').value = env.id;
                  document.getElementById('env-name').value = env.name;
                  document.getElementById('env-location').value = env.location;
                  document.getElementById('env-equipment').value = env.equipment;

                  // Limpa e preenche os campos de responsáveis
                  responsibilitiesListDiv.innerHTML = ''; // Limpa a lista atual
                  if (env.responsibilities && env.responsibilities.length > 0) {
                       env.responsibilities.forEach(resp => {
                          addResponsibilityInput(resp.time, resp.name);
                      });
                  } else {
                       addResponsibilityInput(); // Adiciona um campo vazio se não houver responsáveis
                  }


                  cancelEditEnvBtn.style.display = 'inline-block'; // Mostra botão de cancelar
                  environmentForm.scrollIntoView({ behavior: 'smooth' }); // Rola até o formulário

              } else if (button.classList.contains('delete-env-btn')) {
                  if (confirm(`Tem certeza que deseja excluir o ambiente "${environments[envIndex].name}"?`)) {
                      const deletedEnvName = environments[envIndex].name;
                      environments.splice(envIndex, 1); // Remove do array
                      renderEnvironmentsTable(); // Atualiza a tabela
                      showNotification(`Ambiente "${deletedEnvName}" excluído.`);
                       // Se estava editando este ambiente, limpa o formulário
                       if (parseInt(document.getElementById('env-edit-id').value) === envId) {
                            environmentForm.reset();
                            document.getElementById('env-edit-id').value = '';
                            resetResponsibilityInputs();
                            cancelEditEnvBtn.style.display = 'none';
                       }
                  }
              }
         });
     }
     // █████████ FIM SEÇÃO MODIFICADA/ADICIONADA █████████

    // --- Lógica Tela de Relatório de Falha (QR Code) ---
    // █████████ NOVA SEÇÃO █████████
    const faultReportForm = document.getElementById('fault-report-form');
    const faultEnvironmentSelect = document.getElementById('fault-environment');
    const faultReportFeedback = document.getElementById('fault-report-feedback');
    const backToLoginLink = document.getElementById('back-to-login-link');

    // Função para popular o <select> de ambientes na tela de falha
    function populateFaultEnvironments() {
        if (!faultEnvironmentSelect) return;
        faultEnvironmentSelect.innerHTML = '<option value="">Selecione o ambiente...</option>'; // Limpa e adiciona opção padrão
        environments.sort((a, b) => a.name.localeCompare(b.name)).forEach(env => {
            const option = document.createElement('option');
            option.value = env.id; // Usa o ID como valor
            option.textContent = `${env.name} (${env.location})`;
            faultEnvironmentSelect.appendChild(option);
        });
    }

    // Listener para o formulário de relatório de falha
    if (faultReportForm) {
        faultReportForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const environmentId = parseInt(faultEnvironmentSelect.value);
            const equipmentName = document.getElementById('fault-equipment').value.trim();
            const description = document.getElementById('fault-description').value.trim();
            const reporterName = document.getElementById('fault-reporter-name').value.trim() || 'Anônimo';

            if (!environmentId) {
                alert("Por favor, selecione o ambiente onde ocorreu o problema.");
                return;
            }
             if (!equipmentName) {
                alert("Por favor, identifique o equipamento com problema.");
                return;
            }
             if (!description) {
                alert("Por favor, descreva o problema encontrado.");
                return;
            }

            const environment = environments.find(env => env.id === environmentId);
            const environmentName = environment ? environment.name : `ID ${environmentId}`;

            // Cria um novo chamado (demanda)
            const newDemand = {
                id: nextDemandId++,
                description: `Falha em "${equipmentName}" no ambiente "${environmentName}": ${description}`,
                priority: "Média", // Prioridade padrão para relatos externos
                requestDate: getTodayDateString(),
                dueDate: null,
                status: "Aberto",
                assignedTech: null,
                actions: "",
                reporter: reporterName, // Nome de quem reportou
                reportedEquipment: equipmentName, // Equipamento reportado
                environmentId: environmentId // ID do ambiente
            };

            demands.push(newDemand);
            console.log("Novo chamado criado a partir do relatório:", newDemand);

            // Feedback para o usuário na tela de relatório
            showNotification("Relatório enviado com sucesso! Um chamado foi aberto para a equipe técnica.", 5000, faultReportFeedback);
            faultReportForm.reset(); // Limpa o formulário
        });
    }

    // Lógica para mostrar a tela de falha (simulando QR Code via Hash ou Link)
    function checkUrlHash() {
        if (window.location.hash === '#fault-report') {
            populateFaultEnvironments(); // Popula o select ANTES de mostrar
            showScreen('fault-report-screen');
            // Limpa o hash para não reativar se o usuário navegar de volta
            // history.pushState("", document.title, window.location.pathname + window.location.search);
        } else if (!currentTechnician) { // Se não está logado, mostra login
             showScreen('login-screen');
        }
        // Se estiver logado e sem hash específico, o estado da tela principal é mantido (ou vai pro dashboard)
    }

    // Listener para o link de teste na tela de login
    const testFaultReportLink = document.getElementById('test-fault-report-link');
    if(testFaultReportLink) {
        testFaultReportLink.addEventListener('click', (e) => {
             e.preventDefault();
             window.location.hash = 'fault-report'; // Define o hash
             checkUrlHash(); // Chama a função para mostrar a tela
        });
    }

     // Listener para o link "Voltar para Login" na tela de falha
     if (backToLoginLink) {
         backToLoginLink.addEventListener('click', (e) => {
             e.preventDefault();
             window.location.hash = ''; // Limpa o hash
             showScreen('login-screen'); // Volta para a tela de login
         });
     }

    // Verifica o Hash da URL ao carregar a página e ao mudar
    window.addEventListener('hashchange', checkUrlHash);
    // █████████ FIM NOVA SEÇÃO █████████


    // --- Inicialização ---
    function renderAllTables() {
         renderDemandsTable();
         renderHistoryTable();
         renderStockTable();
         renderEnvironmentsTable();
         // Popula o select na tela de falha caso ela seja acessada diretamente
         populateFaultEnvironments();
         // Adiciona o primeiro campo de responsável vazio no formulário de ambientes
         resetResponsibilityInputs();
    }

    // Decide qual tela mostrar inicialmente
    checkUrlHash(); // Verifica se deve ir para a tela de falha

    // Se não foi para a tela de falha, e não está logado, vai pro login (já tratado no checkUrlHash)
    // Se estava logado (simulado), renderiza tabelas - isso acontece no submit do login

    console.log("Sistema pronto.");
}); // Fim do DOMContentLoaded