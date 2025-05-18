class Item {
    constructor(name, minPrice, maxPrice, weight) {
        this.name = name;
        this.minPrice = minPrice;
        this.maxPrice = maxPrice;
        this.weight = weight;
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
        this.storage = { capacity: 5, used: 0 };
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
            "Tijuca", "Centro", "Barra da Tijuca", "Complexo do Alemão", "Banco"
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
        this.maxLoan = 50000;
        this.loanSharkSoldiers = 10;
        this.soldierBaseCost = 1000;
        this.soldierCostMultiplier = 1.5;
        this.events = [];
        this.reputation = 50;
        this.policeAlertLevel = 0;
        this.maxReputation = 100;
        this.maxPoliceAlert = 100;
        this.bankInterestRate = 0.02;
        this.gameOver = false;
        this.initializeGame();
    }

    initializeGame() {
        this.log("Bem-vindo ao mundo do crime.");
        this.log("Você desistiu da vida honesta e entrou para o crime, mas está devendo R$5.000 ao agiota.");
        this.updatePrices();
        this.generateRandomEvents();
        this.renderUI();
    }

    log(message) {
        this.logMessages.unshift(message);
        if (this.logMessages.length > 20) this.logMessages.pop();
        this.renderLog();
    }

    generateRandomEvents() {
        this.events = [
            { name: "Polícia na área", effect: () => this.increasePoliceAlert(10), chance: 0.08 },
            { name: "Demanda alta", effect: () => this.increasePrices(20), chance: 0.08 },
            { name: "Demanda baixa", effect: () => this.decreasePrices(20), chance: 0.08 },
            { name: "Cracudo roubou", effect: () => this.stealMoney(500), chance: 0.04 },
            { name: "Prostituta pediu propina", effect: () => this.payBribe(300), chance: 0.04 },
            { name: "Policial corrupto pede propina", effect: () => this.policeBribeEvent(), chance: 0.04 },
            { name: "Informante preso", effect: () => this.decreaseReputation(10), chance: 0.03 },
            { name: "Suborno bem-sucedido", effect: () => this.decreasePoliceAlert(20), chance: 0.03 },
            { name: "Polícia faz batida surpresa", effect: () => this.policeRaid(), chance: 0.03 },
            { name: "Cliente VIP", effect: () => this.vipClient(), chance: 0.02 },
            { name: "Cracudo pede ajuda", effect: () => this.helpCracudo(), chance: 0.02 },
            { name: "Polícia oferece proteção", effect: () => this.policeProtectionEvent(), chance: 0.02 },
            { name: "Polícia pede informação", effect: () => this.policeInfoEvent(), chance: 0.02 },
            { name: "Polícia tenta te prender", effect: () => this.policeArrestEvent(), chance: 0.02 },
            { name: "Polícia faz busca", effect: () => this.policeSearchEvent(), chance: 0.02 },
        ];
    }

    triggerRandomEvent() {
        if (this.gameOver) return;
        this.events.forEach(event => {
            if (Math.random() < event.chance) {
                event.effect();
                this.log(`Evento: ${event.name}`);
            }
        });
    }

    stealMoney(amount) {
        if (this.player.money >= amount) {
            this.player.money -= amount;
            this.log(`Um cracudo roubou R$${amount.toFixed(2)} de você.`);
        }
    }

    payBribe(amount) {
        if (this.player.money >= amount) {
            this.player.money -= amount;
            this.log(`Você pagou R$${amount.toFixed(2)} de propina.`);
        }
    }

    policeBribeEvent() {
        if (this.gameOver) return;
        if (confirm("Um policial corrupto pede R$1000 de propina para não aumentar seu alerta policial. Pagar?")) {
            if (this.player.money >= 1000) {
                this.player.money -= 1000;
                this.decreasePoliceAlert(10);
                this.log("Você pagou propina ao policial e diminuiu o alerta.");
            } else {
                this.increasePoliceAlert(10);
                this.log("Você não tinha dinheiro para pagar propina. O alerta aumentou.");
            }
        } else {
            this.increasePoliceAlert(10);
            this.log("Você recusou pagar propina. O alerta aumentou.");
        }
    }

    policeProtectionEvent() {
        if (this.gameOver) return;
        if (confirm("A polícia oferece proteção por R$2000. Aceitar?")) {
            if (this.player.money >= 2000) {
                this.player.money -= 2000;
                this.decreasePoliceAlert(20);
                this.increaseReputation(5);
                this.log("Você aceitou proteção policial. Alerta diminuiu e reputação aumentou.");
            } else {
                this.log("Você não tinha dinheiro para aceitar proteção.");
            }
        }
    }

    policeInfoEvent() {
        if (this.gameOver) return;
        if (confirm("A polícia pede informações sobre um rival. Se aceitar, reputação diminui mas alerta policial diminui. Aceitar?")) {
            this.decreaseReputation(10);
            this.decreasePoliceAlert(15);
            this.log("Você colaborou com a polícia. Alerta diminuiu, reputação caiu.");
        }
    }

    policeArrestEvent() {
        if (this.gameOver) return;
        if (Math.random() < 0.5) {
            this.player.health -= 20;
            this.increasePoliceAlert(15);
            this.log("A polícia tentou te prender. Você resistiu e perdeu saúde.");
            if (this.player.health <= 0) this.endGame();
        } else {
            this.log("A polícia tentou te prender, mas você escapou.");
        }
    }

    policeSearchEvent() {
        if (this.gameOver) return;
        let found = false;
        for (const [item, qty] of Object.entries(this.player.inventory)) {
            if (qty > 0 && Math.random() < 0.3) {
                this.player.inventory[item] = 0;
                found = true;
                this.log(`A polícia encontrou e confiscou todo seu ${item}.`);
            }
        }
        if (!found) this.log("A polícia fez busca, mas não encontrou nada.");
    }

    policeRaid() {
        if (this.gameOver) return;
        const loss = Math.floor(this.player.money * 0.3);
        this.player.money -= loss;
        this.policeAlertLevel += 10;
        this.log(`A polícia fez uma batida surpresa. Você perdeu R$${loss} e o alerta aumentou.`);
    }

    vipClient() {
        if (this.gameOver) return;
        const item = this.items[Math.floor(Math.random() * this.items.length)];
        const qty = Math.floor(Math.random() * 10) + 1;
        if ((this.player.inventory[item.name] || 0) >= qty) {
            const bonus = item.currentPrice * qty * 2;
            this.player.money += bonus;
            this.player.inventory[item.name] -= qty;
            this.log(`Cliente VIP comprou ${qty}g de ${item.name} por R$${bonus.toFixed(2)}.`);
        }
    }

    helpCracudo() {
        if (this.gameOver) return;
        if (this.player.money >= 100) {
            this.player.money -= 100;
            this.increaseReputation(5);
            this.log("Você ajudou um cracudo e ganhou reputação.");
        }
    }

    depositMoney(amount) {
        if (this.gameOver) return;
        if (amount > 0 && this.player.money >= amount) {
            this.player.money -= amount;
            this.player.bank += amount;
            this.log(`Você depositou R$${amount.toFixed(2)} no banco.`);
            this.renderUI();
        } else {
            alert("Dinheiro insuficiente para depositar!");
        }
    }

    withdrawMoney(amount) {
        if (this.gameOver) return;
        if (amount > 0 && this.player.bank >= amount) {
            this.player.bank -= amount;
            this.player.money += amount;
            this.log(`Você sacou R$${amount.toFixed(2)} do banco.`);
            this.renderUI();
        } else {
            alert("Dinheiro insuficiente no banco para sacar!");
        }
    }

    increasePoliceAlert(amount) {
        this.policeAlertLevel = Math.min(this.maxPoliceAlert, this.policeAlertLevel + amount);
        this.log(`🚨 Nível de alerta da polícia aumentou para ${this.policeAlertLevel}.`);
        if (this.policeAlertLevel >= 100) {
            this.log("🚔 A polícia invadiu sua operação! Você perdeu tudo.");
            this.endGame();
        }
    }

    decreasePoliceAlert(amount) {
        this.policeAlertLevel = Math.max(0, this.policeAlertLevel - amount);
        this.log(`🚔 Nível de alerta da polícia diminuiu para ${this.policeAlertLevel}.`);
    }

    increaseReputation(amount) {
        this.reputation = Math.min(this.maxReputation, this.reputation + amount);
        this.log(`⭐ Sua reputação aumentou para ${this.reputation}.`);
    }

    decreaseReputation(amount) {
        this.reputation = Math.max(0, this.reputation - amount);
        this.log(`⚠️ Sua reputação diminuiu para ${this.reputation}.`);
    }

    increasePrices(percentage) {
        this.items.forEach(item => {
            item.currentPrice *= 1 + percentage / 100;
        });
        this.log("📈 Os preços das drogas aumentaram devido à alta demanda.");
    }

    decreasePrices(percentage) {
        this.items.forEach(item => {
            item.currentPrice *= 1 - percentage / 100;
        });
        this.log("📉 Os preços das drogas diminuíram devido à baixa demanda.");
    }

    moveToLocation(newLocation) {
        if (this.gameOver) return;
        if (this.locations.includes(newLocation)) {
            this.player.currentLocation = newLocation;
            this.log(`Você se mudou para ${newLocation}.`);
            this.nextDay();
            this.updatePrices();
            this.triggerRandomEvent();
            this.renderUI();
        }
    }

    buyItem(itemName, quantity) {
        if (this.gameOver) return;
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
        if (this.gameOver) return;
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
        if (this.gameOver) return;
        this.player.day++;
        if (this.player.debt > 0) {
            const debtIncrease = this.player.debt * (Math.random() * 0.25 + 0.01);
            this.player.debt += debtIncrease;
            this.log(`Sua dívida aumentou para R$${this.player.debt.toFixed(2)}.`);
        }
        if (this.player.bank > 0) {
            const interest = this.player.bank * this.bankInterestRate;
            this.player.bank += interest;
            this.log(`Você ganhou R$${interest.toFixed(2)} de juros no banco.`);
        }
        this.triggerRandomEvent();
    }

    attackPlayer(extraSoldiers) {
        const totalSoldiers = extraSoldiers + this.loanSharkSoldiers;
        const playerSoldiers = this.player.soldiers;
        if (playerSoldiers >= totalSoldiers) {
            this.log(`👥 Seus soldados derrotaram os ${totalSoldiers} soldados enviados pelo agiota.`);
            this.player.soldiers -= totalSoldiers;
        } else {
            const damage = (totalSoldiers - playerSoldiers) * 10;
            this.player.health -= damage;
            this.player.soldiers = 0;
            this.log(`💥 O agiota enviou ${totalSoldiers} soldados. Você sofreu ${damage} de dano.`);
        }
        if (this.player.health <= 0) {
            this.log("☠️ Você morreu! O agiota tomou tudo.");
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
        const amount = parseFloat(slider.value);
        if (amount > 0 && this.player.money >= amount) {
            this.player.money -= amount;
            this.player.debt -= amount;
            if (this.player.debt <= 1) {
                this.player.debt = 0;
                this.log("💳 Você quitou sua dívida com o agiota!");
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
            this.log(`💳 Você tomou emprestado R$${amount} do agiota.`);
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
            this.player.storage.capacity += 2;
            this.log(`👥 Você comprou um soldado por R$${cost.toFixed(2)}. Agora você tem ${this.player.soldiers} soldados.`);
            this.renderUI();
        } else {
            alert("Dinheiro insuficiente para comprar um soldado!");
        }
    }

    attackLoanShark() {
        if (this.player.soldiers > this.loanSharkSoldiers) {
            this.log("☠️ Você matou o agiota! Ele não existe mais no jogo.");
            this.loanSharkSoldiers = 0;
            this.player.debt = 0;
            this.renderUI();
        } else {
            const damage = (this.loanSharkSoldiers - this.player.soldiers) * 10;
            this.player.health -= damage;
            this.player.soldiers = 0;
            this.log(`💥 Você tentou atacar o agiota, mas falhou. Você sofreu ${damage} de dano.`);
            if (this.player.health <= 0) {
                this.log("☠️ Você morreu! O agiota tomou tudo.");
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
        if (this.gameOver) {
            // Bloqueia todos os botões e sliders
            document.querySelectorAll("button, input[type=range]").forEach(el => el.disabled = true);
        }
    }

    renderLog() {
        const logDiv = document.getElementById('log');
        if (logDiv) {
            logDiv.innerHTML = '<h3 style="font-size:0.95em;font-weight:normal;margin-bottom:5px;">Log de Mensagens</h3>';
            logDiv.innerHTML += this.logMessages.map(msg => `<div style="font-size:0.85em;">${msg}</div>`).join('');
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
                <div>⭐ Reputation: ${this.reputation}</div>
                <div>🚔 Police Alert: ${this.policeAlertLevel}</div>
                <div>📦 Storage: ${this.player.storage.used.toFixed(2)}/${this.player.storage.capacity.toFixed(2)}kg</div>
                <div>👥 Soldiers: ${this.player.soldiers}</div>
                <div>📍 Location: ${this.player.currentLocation}</div>
                <div>📅 Day: ${this.player.day}</div>
            `;
        }
    }

    getDebtColor(debt) {
        const maxDebt = 100000;
        const acceptableDebt = 50000;
        const ratio = Math.min(1, (debt - acceptableDebt) / (maxDebt - acceptableDebt));
        const red = Math.floor(255 * ratio);
        const green = Math.floor(255 * (1 - ratio));
        return `rgb(${red}, ${green}, 0)`;
    }

    updatePrices() {
        this.items.forEach(item => {
            const oldPrice = item.currentPrice || 0;
            item.currentPrice = item.generatePrice();
            this.previousPrices[item.name] = oldPrice;
        });
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

        if (this.player.currentLocation === "Banco") {
            const bankDiv = document.createElement('div');
            bankDiv.id = 'bank';
            bankDiv.innerHTML = `
                <h3>Banco</h3>
                <button onclick="game.depositMoney(1000)">Depositar R$1000</button>
                <button onclick="game.withdrawMoney(1000)">Sacar R$1000</button>
            `;
            locationsDiv.appendChild(bankDiv);
        }

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
        this.gameOver = true;
        this.log("GAME OVER. Você perdeu.");
        this.renderUI();
    }
}

const game = new Game();
