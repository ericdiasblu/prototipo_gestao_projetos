document.addEventListener('DOMContentLoaded', () => {
    const loginScreen = document.getElementById('login-screen');
    const mainAppScreen = document.getElementById('main-app');
    const loginForm = document.getElementById('login-form');
    const logoutBtn = document.getElementById('logout-btn');
    const notificationArea = document.getElementById('notification-area');

    const screens = document.querySelectorAll('.screen');
    const contentSections = document.querySelectorAll('.main-content .content-section');
    const navButtons = document.querySelectorAll('.sidebar .nav-btn');
    const backButtons = document.querySelectorAll('.back-to-dashboard');

    let demands = [
        { id: 1, description: "Computador Lento Lab 101", priority: "Média", requestDate: "2024-07-14", dueDate: "", status: "Aberto", assignedTech: null, actions: "" },
        { id: 2, description: "Impressora Bloco B não imprime", priority: "Alta", requestDate: "2024-07-15", dueDate: "2024-07-16", status: "Em Andamento", assignedTech: "Silva", actions: "Verificado toner e conexão. Aguardando peça." }
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
    let environments = [
        { id: 1, name: "Laboratório de Informática 1", location: "Bloco C, Sala 201", equipment: "15 PCs Dell, 1 Projetor", responsible: "Prof. Carlos" },
        { id: 2, name: "Secretaria Acadêmica", location: "Bloco A, Térreo", equipment: "3 PCs, 2 Impressoras", responsible: "Maria Silva" }
    ];
    let nextDemandId = 3;
    let nextHistoryId = 102;
    let nextStockId = 5;
    let nextEnvironmentId = 3;

    let currentTechnician = "Admin";

    function showScreen(screenToShowId) {
        screens.forEach(screen => {
            screen.classList.toggle('active', screen.id === screenToShowId);
        });
         if (screenToShowId === 'login-screen') {
             mainAppScreen.classList.remove('active');
         }
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

    function renderDemandsTable() {
        const tableBody = document.getElementById('demand-list-table-body');
        const openDemandsList = document.getElementById('dashboard-open-demands');
        tableBody.innerHTML = '';
        openDemandsList.innerHTML = '';
        let openCount = 0;
        let progressCount = 0;
        let completedCount = 0;

        const openOrProgressDemands = demands.filter(d => d.status === 'Aberto' || d.status === 'Em Andamento');

        if (openOrProgressDemands.length === 0) {
             openDemandsList.innerHTML = '<li>Nenhum chamado ativo.</li>';
        } else {
             openOrProgressDemands.forEach(demand => {
                 const li = document.createElement('li');
                 li.innerHTML = `#${demand.id}: ${demand.description.substring(0, 30)}... (${demand.status})`;
                 openDemandsList.appendChild(li);
             });
        }

        demands.forEach(demand => {
            const row = tableBody.insertRow();
            row.innerHTML = `
                <td>${demand.id}</td>
                <td>${demand.description}</td>
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

    function renderEnvironmentsTable() {
        const tableBody = document.getElementById('environments-table-body');
        tableBody.innerHTML = '';
        environments.forEach(env => {
            const row = tableBody.insertRow();
            row.innerHTML = `
                <td>${env.name}</td>
                <td>${env.location}</td>
                <td>${env.responsible}</td>
                <td class="action-buttons">
                    <button class="btn btn-sm edit-env-btn" data-id="${env.id}">Editar</button>
                    <button class="btn btn-sm btn-danger delete-env-btn" data-id="${env.id}">Excluir</button>
                </td>
            `;
        });
    }

    function showNotification(message, duration = 3000) {
        notificationArea.textContent = message;
        notificationArea.classList.add('show');
        setTimeout(() => {
            notificationArea.classList.remove('show');
        }, duration);
    }

     function formatDate(dateString) {
        if (!dateString) return 'N/A';
        const date = new Date(dateString + 'T00:00:00');
        return date.toLocaleDateString('pt-BR');
    }

    function getTodayDateString() {
         return new Date().toISOString().split('T')[0];
    }

    if (loginForm) {
        loginForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const username = document.getElementById('username').value;
            console.log('Login com:', username);
            currentTechnician = username;
            showScreen('main-app');
            showContentSection('dashboard-screen');
            renderAllTables();
            showNotification(`Bem-vindo, ${currentTechnician}!`);
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            console.log('Logout...');
            showScreen('login-screen');
        });
    }

    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetSectionId = button.dataset.target;
            if (targetSectionId) {
                showContentSection(targetSectionId);
            }
        });
    });
    backButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetSectionId = button.dataset.target;
             if (targetSectionId) {
                showContentSection(targetSectionId);
            }
        });
    });

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
                actions: ""
            };
            demands.push(newDemand);
            renderDemandsTable();
            demandForm.reset();
            document.getElementById('demand-date').value = getTodayDateString();
            showNotification("Demanda registrada com sucesso!");
            showContentSection('demand-list-screen');
        });
    }

     const demandListTable = document.getElementById('demand-list-table-body');
     const demandDetailsSection = document.getElementById('demand-details-section');
     let selectedDemandId = null;

     if (demandListTable) {
         demandListTable.addEventListener('click', (e) => {
             if (e.target.classList.contains('view-demand-btn')) {
                 selectedDemandId = parseInt(e.target.dataset.id);
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

                     if (demand.status === 'Concluído') {
                         completeBtn.style.display = 'none';
                         startBtn.style.display = 'none';
                         actionsTextarea.readOnly = true;
                     } else if (demand.status === 'Em Andamento') {
                         completeBtn.style.display = 'inline-block';
                         startBtn.style.display = 'none';
                         actionsTextarea.readOnly = false;
                     } else {
                         completeBtn.style.display = 'none';
                         startBtn.style.display = 'inline-block';
                         actionsTextarea.readOnly = true;
                     }

                     demandDetailsSection.style.display = 'block';
                 }
             } else if (e.target.classList.contains('delete-demand-btn')) {
                  const demandIdToDelete = parseInt(e.target.dataset.id);
                   if (confirm(`Tem certeza que deseja excluir a Demanda #${demandIdToDelete}?`)) {
                        demands = demands.filter(d => d.id !== demandIdToDelete);
                        renderDemandsTable();
                        demandDetailsSection.style.display = 'none';
                        showNotification(`Demanda #${demandIdToDelete} excluída.`);
                   }
             }
         });
     }

     const startDemandBtn = document.getElementById('start-demand-btn');
     if(startDemandBtn) {
         startDemandBtn.addEventListener('click', () => {
             if (selectedDemandId) {
                 const demandIndex = demands.findIndex(d => d.id === selectedDemandId);
                 if (demandIndex > -1 && demands[demandIndex].status === 'Aberto') {
                     demands[demandIndex].status = 'Em Andamento';
                     demands[demandIndex].assignedTech = currentTechnician;
                     renderDemandsTable();
                     document.getElementById('details-demand-status').textContent = 'Em Andamento';
                     document.getElementById('start-demand-btn').style.display = 'none';
                      document.getElementById('complete-demand-btn').style.display = 'inline-block';
                     document.getElementById('demand-actions-performed').readOnly = false;
                     showNotification(`Atendimento da Demanda #${selectedDemandId} iniciado.`);
                 }
             }
         });
     }

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
                    demands[demandIndex].status = 'Concluído';
                    demands[demandIndex].actions = actions;

                    const historyRecord = {
                        id: nextHistoryId++,
                        completedDate: getTodayDateString(),
                        tech: demands[demandIndex].assignedTech || currentTechnician,
                        originalDemandId: demands[demandIndex].id,
                        description: actions,
                        status: "Concluído"
                    };
                    history.push(historyRecord);

                    renderDemandsTable();
                    renderHistoryTable();
                    demandDetailsSection.style.display = 'none';
                    showNotification(`Demanda #${selectedDemandId} concluída e registrada no histórico.`);
                }
            }
        });
    }

    const addStockForm = document.getElementById('add-stock-item-form');
    if (addStockForm) {
        addStockForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const newItem = {
                id: nextStockId++,
                name: document.getElementById('stock-item-name').value,
                quantity: parseInt(document.getElementById('stock-item-qty').value) || 0,
                minQuantity: parseInt(document.getElementById('stock-item-min-qty').value) || 0
            };
            stock.push(newItem);
            renderStockTable();
            addStockForm.reset();
            showNotification(`Item "${newItem.name}" adicionado ao estoque.`);
        });
    }

     const stockTableBody = document.getElementById('stock-table-body');
     if (stockTableBody) {
         stockTableBody.addEventListener('click', (e) => {
             const target = e.target;
             const itemId = parseInt(target.dataset.id);
             const itemIndex = stock.findIndex(item => item.id === itemId);

             if (itemIndex === -1) return;

             if (target.classList.contains('stock-action-btn')) {
                 const action = target.dataset.action;
                 let quantityChange = 0;
                  if(action === 'add') {
                      quantityChange = parseInt(prompt(`Quantidade a adicionar para "${stock[itemIndex].name}":`, "1")) || 0;
                      if (quantityChange > 0) {
                         stock[itemIndex].quantity += quantityChange;
                         showNotification(`${quantityChange} unidade(s) de "${stock[itemIndex].name}" adicionada(s).`);
                      }
                  } else if (action === 'remove') {
                     quantityChange = parseInt(prompt(`Quantidade a remover de "${stock[itemIndex].name}" (máx: ${stock[itemIndex].quantity}):`, "1")) || 0;
                      if (quantityChange > 0 && quantityChange <= stock[itemIndex].quantity) {
                          stock[itemIndex].quantity -= quantityChange;
                          showNotification(`${quantityChange} unidade(s) de "${stock[itemIndex].name}" removida(s).`);
                      } else if (quantityChange > stock[itemIndex].quantity) {
                          alert("Quantidade a remover maior que o estoque atual!");
                      }
                  }
                 if (quantityChange !== 0) renderStockTable();

             } else if (target.classList.contains('delete-stock-btn')) {
                 if (confirm(`Tem certeza que deseja excluir o item "${stock[itemIndex].name}" do estoque?`)) {
                     const deletedItemName = stock[itemIndex].name;
                     stock.splice(itemIndex, 1);
                     renderStockTable();
                     showNotification(`Item "${deletedItemName}" excluído.`);
                 }
             }
         });
     }

    const environmentForm = document.getElementById('environment-form');
    const cancelEditEnvBtn = document.getElementById('cancel-edit-env-btn');
    if (environmentForm) {
        environmentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const editId = parseInt(document.getElementById('env-edit-id').value);
            const envData = {
                name: document.getElementById('env-name').value,
                location: document.getElementById('env-location').value,
                equipment: document.getElementById('env-equipment').value,
                responsible: document.getElementById('env-responsible').value
            };

            if (editId) {
                const index = environments.findIndex(env => env.id === editId);
                if (index > -1) {
                    environments[index] = { ...environments[index], ...envData };
                    showNotification(`Ambiente "${envData.name}" atualizado.`);
                }
            } else {
                envData.id = nextEnvironmentId++;
                environments.push(envData);
                showNotification(`Ambiente "${envData.name}" adicionado.`);
            }

            renderEnvironmentsTable();
            environmentForm.reset();
            document.getElementById('env-edit-id').value = '';
            cancelEditEnvBtn.style.display = 'none';
        });
    }

     if(cancelEditEnvBtn) {
         cancelEditEnvBtn.addEventListener('click', () => {
             environmentForm.reset();
             document.getElementById('env-edit-id').value = '';
             cancelEditEnvBtn.style.display = 'none';
         });
     }

     const environmentsTableBody = document.getElementById('environments-table-body');
     if (environmentsTableBody) {
         environmentsTableBody.addEventListener('click', (e) => {
              const target = e.target;
             const envId = parseInt(target.dataset.id);
             const envIndex = environments.findIndex(env => env.id === envId);

             if (envIndex === -1) return;

             if (target.classList.contains('edit-env-btn')) {
                 const env = environments[envIndex];
                 document.getElementById('env-edit-id').value = env.id;
                 document.getElementById('env-name').value = env.name;
                 document.getElementById('env-location').value = env.location;
                 document.getElementById('env-equipment').value = env.equipment;
                 document.getElementById('env-responsible').value = env.responsible;
                 cancelEditEnvBtn.style.display = 'inline-block';
                 environmentForm.scrollIntoView({ behavior: 'smooth' });
             } else if (target.classList.contains('delete-env-btn')) {
                 if (confirm(`Tem certeza que deseja excluir o ambiente "${environments[envIndex].name}"?`)) {
                     const deletedEnvName = environments[envIndex].name;
                     environments.splice(envIndex, 1);
                     renderEnvironmentsTable();
                     showNotification(`Ambiente "${deletedEnvName}" excluído.`);
                 }
             }
         });
     }

     function renderAllTables() {
         renderDemandsTable();
         renderHistoryTable();
         renderStockTable();
         renderEnvironmentsTable();
     }

     console.log("Sistema pronto.");

});