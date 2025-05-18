class Item {
    constructor(name, minPrice, maxPrice, weight) {
        this.name = name;
        this.minPrice = minPrice;
        this.maxPrice = maxPrice;
        this.weight = weight; // in kg or g depending on the item
        this.currentPrice = this.generatePrice();
    }

    generatePrice() {
        return Math.floor(Math.random() * (this.maxPrice - this.minPrice + 1)) + this.minPrice;
    }
}

class Player {
    constructor() {
        this.money = 2000;
        this.bank = 0;
        this.debt = 5000;
        this.health = 100;
        this.storage = {
            capacity: 5, // in kg
            used: 0
        };
        this.soldiers = 0;
        this.inventory = {};
        this.day = 1;
        this.currentLocation = "Copacabana";
    }
}

class Game {
    constructor() {
        this.player = new Player();
        this.locations = [
            "Copacabana", "Rocinha", "Maré",
            "Tijuca", "Centro", "Barra da Tijuca", "Complexo do Alemão"
        ];
        this.items = [
            new Item("Maconha", 2, 4, 0.001),
            new Item("Cocaína", 70, 100, 0.001),
            new Item("Pasta Base", 45, 65, 0.001),
            new Item("Skank", 8, 12, 0.001),
            new Item("Crack", 8, 15, 0.001),
            new Item("Haxixe", 8, 15, 0.001),
            new Item("Haxixe Marroquino", 65, 85, 0.001),
            new Item("BHOil", 75, 95, 0.001)
        ];
        this.previousPrices = {};
        this.logMessages = [];
        this.maxLoan = 50000; // Máximo que pode ser tomado emprestado do agiota
        this.loanSharkSoldiers = 10; // Soldados do agiota
        this.soldierBaseCost = 1000; // Custo inicial de um soldado
        this.soldierCostMultiplier = 1.5; // Multiplicador de custo para cada compra subsequente
        this.initializeGame();
    }

    initializeGame() {
        this.addLogMessage("Bem-vindo ao mundo do crime!");
        this.addLogMessage("Você desistiu da vida honesta e entrou para o crime, mas está devendo R$5.000 ao agiota.");
        this.updatePrices();
        this.renderUI();
    }

    addLogMessage(message) {
        this.logMessages.unshift(message); // Adiciona a mensagem no início do log
        if (this.logMessages.length > 10) {
            this.logMessages.pop(); // Remove mensagens antigas para manter o log compacto
        }
        this.renderLog();
    }

    updatePrices() {
        this.items.forEach(item => {
            const oldPrice = item.currentPrice || 0;
            item.currentPrice = item.generatePrice();

            // Eventos raros de variação de preço
            const randomEvent = Math.random();
            if (randomEvent <= 0.005) {
                item.currentPrice *= 10;
                this.addLogMessage(`🚨 Demanda explosiva! O preço de ${item.name} disparou drasticamente.`);
            } else if (randomEvent <= 0.01) {
                item.currentPrice /= 10;
                this.addLogMessage(`🚨 Produção em massa! O preço de ${item.name} caiu drasticamente.`);
            } else if (randomEvent <= 0.03) {
                item.currentPrice /= 4;
                this.addLogMessage(`📉 Aumento na produção de ${item.name}, reduzindo o preço.`);
            } else if (randomEvent <= 0.05) {
                item.currentPrice *= 4;
                this.addLogMessage(`📈 Escassez de ${item.name} no mercado, aumentando o preço.`);
            }

            this.previousPrices[item.name] = oldPrice;
        });
    }

    moveToLocation(newLocation) {
        if (this.locations.includes(newLocation)) {
            this.player.currentLocation = newLocation;
            this.addLogMessage(`Você se mudou para ${newLocation}.`);
            this.nextDay(); // Avança o dia
            this.updatePrices(); // Atualiza os preços das drogas
            this.renderUI(); // Atualiza a interface
        }
    }

    buyItem(itemName, quantity) {
        const item = this.items.find(i => i.name === itemName);
        const totalCost = item.currentPrice * quantity;
        const totalWeight = item.weight * quantity;

        if (quantity > 0 && this.player.money >= totalCost) {
            if (this.player.storage.used + totalWeight <= this.player.storage.capacity) {
                this.player.money -= totalCost;
                this.player.inventory[itemName] = (this.player.inventory[itemName] || 0) + quantity;
                this.player.storage.used += totalWeight;
                this.renderUI();
            } else {
                alert("Sem espaço suficiente no armazenamento!");
            }
        } else {
            alert("Dinheiro insuficiente ou quantidade inválida!");
        }
    }

    sellItem(itemName, quantity) {
        const item = this.items.find(i => i.name === itemName);
        if (quantity > 0 && this.player.inventory[itemName] >= quantity) {
            const totalPrice = item.currentPrice * quantity;
            this.player.money += totalPrice;
            this.player.inventory[itemName] -= quantity;
            this.player.storage.used -= item.weight * quantity;

            if (this.player.inventory[itemName] <= 0) {
                delete this.player.inventory[itemName];
            }

            this.renderUI();
        } else {
            alert("Quantidade inválida ou insuficiente no inventário!");
        }
    }

    nextDay() {
        this.player.day++;
        if (this.player.debt > 0) {
            const debtIncrease = this.player.debt * (Math.random() * 0.25 + 0.01); // 1% a 25% do valor atual
            this.player.debt += debtIncrease;
            this.addLogMessage(`💳 Sua dívida aumentou para R$${this.player.debt.toFixed(2)}.`);

            // Enviar soldados do agiota se a dívida for maior que 100k
            if (this.player.debt > 100000) {
                const extraSoldiers = Math.floor((this.player.debt - 100000) / 10000);
                this.attackPlayer(extraSoldiers);
            }
        }
    }

    attackPlayer(extraSoldiers) {
        const totalSoldiers = extraSoldiers + this.loanSharkSoldiers;
        const playerSoldiers = this.player.soldiers;

        if (playerSoldiers >= totalSoldiers) {
            this.addLogMessage(`👥 Seus soldados derrotaram os ${totalSoldiers} soldados enviados pelo agiota.`);
            this.player.soldiers -= totalSoldiers;
        } else {
            const damage = (totalSoldiers - playerSoldiers) * 10;
            this.player.health -= damage;
            this.player.soldiers = 0; // Todos os soldados do player morreram
            this.addLogMessage(`💥 O agiota enviou ${totalSoldiers} soldados. Você sofreu ${damage} de dano.`);
        }

        if (this.player.health <= 0) {
            this.addLogMessage("☠️ Você morreu! O agiota tomou tudo.");
            this.endGame();
        }
    }

    interactWithLoanShark() {
        const loanSharkDiv = document.getElementById('loan-shark');
        loanSharkDiv.innerHTML = `
            <div class="loan-shark-controls">
                <input type="range" min="0" max="${this.player.debt > 0 ? this.player.debt : this.maxLoan}" value="0" id="loan-slider">
                <span id="loan-amount">0</span>
                <button onclick="game.payLoan()">Pagar</button>
                <button onclick="game.takeLoan()" ${this.player.debt > 0 ? 'disabled' : ''}>Tomar emprestado</button>
            </div>
        `;
        const slider = document.getElementById('loan-slider');
        const loanAmount = document.getElementById('loan-amount');
        slider.oninput = () => {
            loanAmount.textContent = `R$${slider.value}`;
        };
    }

    payLoan() {
        const slider = document.getElementById('loan-slider');
        const amount = parseFloat(slider.value); // Aceita valores decimais
        if (amount > 0 && this.player.money >= amount) {
            this.player.money -= amount;
            this.player.debt -= amount;
            if (this.player.debt <= 1) { // Se a dívida for menor ou igual a 1, zera
                this.player.debt = 0;
                this.addLogMessage("💳 Você quitou sua dívida com o agiota!");
            }
            this.renderUI();
        } else {
            alert("Dinheiro insuficiente para pagar o débito!");
        }
    }

    takeLoan() {
        const slider = document.getElementById('loan-slider');
        const amount = parseInt(slider.value);
        if (amount > 0 && this.player.debt === 0 && amount <= this.maxLoan) {
            this.player.money += amount;
            this.player.debt += amount;
            this.logMessage(`💳 Você tomou emprestado R$${amount} do agiota.`);
            this.renderUI();
        } else {
            alert("Não é possível tomar emprestado no momento!");
        }
    }

    buySoldier() {
        const cost = this.soldierBaseCost * Math.pow(this.soldierCostMultiplier, this.player.soldiers);
        if (this.player.money >= cost) {
            this.player.money -= cost;
            this.player.soldiers++;
            this.player.storage.capacity += 2; // Cada soldado aumenta o storage em 2kg
            this.addLogMessage(`👥 Você comprou um soldado por R$${cost.toFixed(2)}. Agora você tem ${this.player.soldiers} soldados.`);
            this.renderUI();
        } else {
            alert("Dinheiro insuficiente para comprar um soldado!");
        }
    }

    attackLoanShark() {
        if (this.player.soldiers > this.loanSharkSoldiers) {
            this.addLogMessage("☠️ Você matou o agiota! Ele não existe mais no jogo.");
            this.loanSharkSoldiers = 0;
            this.player.debt = 0;
            this.renderUI();
        } else {
            const damage = (this.loanSharkSoldiers - this.player.soldiers) * 10;
            this.player.health -= damage;
            this.player.soldiers = 0; // Todos os soldados do player morreram
            this.addLogMessage(`💥 Você tentou atacar o agiota, mas falhou. Você sofreu ${damage} de dano.`);
            if (this.player.health <= 0) {
                this.addLogMessage("☠️ Você morreu! O agiota tomou tudo.");
                this.endGame();
            }
        }
    }

    renderUI() {
        this.renderStatusBar();
        this.renderMarket();
        this.renderInventory();
        this.renderLocations();
        this.renderLog();
    }

    renderLog() {
        const logDiv = document.getElementById('log');
        if (logDiv) {
            logDiv.innerHTML = '<h3>Log de Mensagens</h3>';
            logDiv.innerHTML += this.logMessages.map(msg => `<div>${msg}</div>`).join('');
        }
    }

    renderStatusBar() {
        const statusBar = document.getElementById('status-bar');
        if (statusBar) {
            const debtColor = this.getDebtColor(this.player.debt);
            statusBar.innerHTML = `
                <div>💰 Cash: R$${this.player.money.toFixed(2)}</div>
                <div>🏦 Bank: R$${this.player.bank.toFixed(2)}</div>
                <div style="color: ${debtColor};">💳 Debt: R$${this.player.debt.toFixed(2)}</div>
                <div>❤️ Health: ${this.player.health}%</div>
                <div>📦 Storage: ${this.player.storage.used.toFixed(2)}/${this.player.storage.capacity.toFixed(2)}kg</div>
                <div>👥 Soldiers: ${this.player.soldiers}</div>
                <div>📍 Location: ${this.player.currentLocation}</div>
                <div>📅 Day: ${this.player.day}</div>
            `;
        }
    }

    getDebtColor(debt) {
        const maxDebt = 100000; // 100k is fully red
        const acceptableDebt = 50000; // 50k is green
        const ratio = Math.min(1, (debt - acceptableDebt) / (maxDebt - acceptableDebt));
        const red = Math.floor(255 * ratio);
        const green = Math.floor(255 * (1 - ratio));
        return `rgb(${red}, ${green}, 0)`;
    }

    renderMarket() {
        const marketDiv = document.getElementById('items-list');
        marketDiv.innerHTML = '<h3>Mercado</h3>';
        this.items.forEach(item => {
            const maxBuyable = Math.min(
                Math.floor(this.player.money / item.currentPrice),
                Math.floor((this.player.storage.capacity - this.player.storage.used) / item.weight)
            );
            const priceChange = this.calculatePriceChange(item);
            const priceChangeColor = priceChange > 0 ? 'darkgreen' : 'darkred';

            const itemDiv = document.createElement('div');
            itemDiv.className = 'market-item';
            itemDiv.innerHTML = `
                <span class="item-name">${item.name}</span>
                <span class="item-price">R$${item.currentPrice.toFixed(2)}/g</span>
                <span class="item-change" style="color: ${priceChangeColor};">(${priceChange > 0 ? '+' : ''}${priceChange}%)</span>
                <div class="item-controls">
                    <input type="range" min="0" max="${maxBuyable}" value="0" id="buy-slider-${item.name}" 
                        oninput="game.updateBuySlider('${item.name}')">
                    <span id="buy-qty-${item.name}">0</span>g
                    <button onclick="game.buyItem('${item.name}', parseInt(document.getElementById('buy-slider-${item.name}').value))">Buy</button>
                </div>
            `;
            marketDiv.appendChild(itemDiv);
        });
    }

    renderInventory() {
        const inventoryDiv = document.getElementById('inventory-list');
        inventoryDiv.innerHTML = '<h3>Inventário</h3>';
        for (const [itemName, quantity] of Object.entries(this.player.inventory)) {
            const item = this.items.find(i => i.name === itemName);
            const itemDiv = document.createElement('div');
            itemDiv.className = 'inventory-item';
            itemDiv.innerHTML = `
                <span class="item-name">${itemName}</span>
                <span class="item-quantity">${quantity}g</span>
                <div class="item-controls">
                    <input type="range" min="0" max="${quantity}" value="0" id="sell-slider-${itemName}" 
                        oninput="game.updateSellSlider('${itemName}')">
                    <span id="sell-qty-${itemName}">0</span>g
                    <button onclick="game.sellItem('${itemName}', parseInt(document.getElementById('sell-slider-${itemName}').value))">Sell</button>
                </div>
            `;
            inventoryDiv.appendChild(itemDiv);
        }
    }

    renderLocations() {
        const locationsDiv = document.getElementById('locations');
        locationsDiv.innerHTML = '<h3>Localizações</h3>';
        this.locations.forEach(location => {
            if (location !== this.player.currentLocation) {
                const btn = document.createElement('button');
                btn.innerText = location;
                btn.onclick = () => this.moveToLocation(location);
                locationsDiv.appendChild(btn);
            }
        });

        if (this.player.currentLocation === "Rocinha" && this.loanSharkSoldiers > 0) {
            const loanSharkDiv = document.createElement('div');
            loanSharkDiv.id = 'loan-shark';
            loanSharkDiv.innerHTML = `
                <h3>Agiota</h3>
                <button onclick="game.interactWithLoanShark()">Interagir</button>
                <button onclick="game.attackLoanShark()">Atacar</button>
            `;
            locationsDiv.appendChild(loanSharkDiv);
        }

        if (this.player.currentLocation === "Complexo do Alemão") {
            const soldierDiv = document.createElement('div');
            soldierDiv.id = 'buy-soldier';
            soldierDiv.innerHTML = `
                <h3>Comprar Soldados</h3>
                <button onclick="game.buySoldier()">Comprar Soldado</button>
            `;
            locationsDiv.appendChild(soldierDiv);
        }
    }

    calculatePriceChange(item) {
        const oldPrice = this.previousPrices[item.name] || item.currentPrice;
        const change = ((item.currentPrice - oldPrice) / oldPrice) * 100;
        return isNaN(change) ? 0 : change.toFixed(1);
    }

    updateBuySlider(itemName) {
        const slider = document.getElementById(`buy-slider-${itemName}`);
        const qtyDisplay = document.getElementById(`buy-qty-${itemName}`);
        qtyDisplay.textContent = slider.value;
    }

    updateSellSlider(itemName) {
        const slider = document.getElementById(`sell-slider-${itemName}`);
        const qtyDisplay = document.getElementById(`sell-qty-${itemName}`);
        qtyDisplay.textContent = slider.value;
    }

    endGame() {
        alert("☠️ Game Over! Você perdeu.");
        location.reload(); // Reinicia o jogo
    }
}

const game = new Game();
