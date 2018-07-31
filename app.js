// Budget Controller
var budgetController = (function(){

    var Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function(totalIncome) {
        
        if(totalIncome > 0){
            this.percentage = Math.round((this.value / totalIncome) * 100);
        }
        else{
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function(){

        return this.percentage;

    };

    var Income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function(type) {
        
        var sum = 0;
        data.allItems[type].forEach(function(cur){
            sum = sum + cur.value;
        });
        // console.log(sum);
        data.totals[type] = sum;
    };

    var data = {
        allItems: {
            expense: [],
            income: []
        },
        totals: {
            expense: 0,
            income: 0
        },
        budget: 0,
        percentage: -1
    };

    return {
        addItem: function(type, des, val){
            var newItem, ID;

            // Create new ID
            if(data.allItems[type].length === 0){
                ID = 0;
            }
            else{
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            }
            
            // Create new object
            if(type === 'expense'){
                newItem = new Expense(ID, des, val);
            }
            else if(type === 'income'){
                newItem = new Income(ID, des, val);
            }

            // push item to array
            data.allItems[type].push(newItem);

            // retrun item
            return newItem;

        },

        deleteItem: function(type, ID) {
            var ids, index;

            ids = data.allItems[type].map(function(current){
                return current.id;
            });

            index = ids.indexOf(ID);

            if(index !== -1) {
                data.allItems[type].splice(index, 1);
            }

        },

        calculateBudget: function() {

            // total income and expense
            calculateTotal('expense');
            calculateTotal('income');

            // calculate budget
            data.budget = data.totals.income - data.totals.expense;

            // calculaet the percentage of income spent
            if(data.totals.income > 0){
                data.percentage = Math.round((data.totals.expense / data.totals.income) * 100);
            }
            else{
                data.percentage = -1;
            }
        },

        calculatePercentages: function() {

            data.allItems.expense.forEach(function(current){
                current.calcPercentage(data.totals.income);
            });
            
        },

        getPercentages: function() {
            var allPercentages;
            allPercentages = data.allItems.expense.map(function(current){
                return current.getPercentage();
            });
            return allPercentages;
        },

        getBudget: function() {
            return {
                budget: data.budget,
                totalIncome: data.totals.income,
                totalExpense: data.totals.expense,
                percentage: data.percentage
            }
        },

        testing: function(){
            console.log(data);
        }
    };

})();

// UI Controller
var UIController = (function(){

    DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercentageLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };

    var formatNumber = function(num, type){
        var numSplit, int, dec;
        num = Math.abs(num).toFixed(2);
        // num = num;
        numSplit = num.split('.');

        int = numSplit[0];
        if(int.length > 3){
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, int.lenght);
        }
    
        dec = numSplit[1];

        return (type === 'income' ? '+' : '-') + ' ' + int + '.' + dec;
    };

    // declare function to traverse a list
    var nodeListForEach = function(list, callback){
        for(var i=0; i<list.length; i++){
            callback(list[i], i);
        }
    };

    return {
        getInput: function(){
            
            return {
                type: document.querySelector(DOMstrings.inputType).value, //Income or Expense (+ or -)
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };

        },

        addListitem: function(obj, type){
            var html, newHtml, element;
            // create html string with placeholder text
            
            if(type === 'income'){
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="income-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            else if(type === 'expense'){
                element = DOMstrings.expensesContainer;
                html = '<div class="item clearfix" id="expense-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            // replace the placeholder with actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            // insert html to DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

        },

        // delete from ui
        deleteListItem: function(selectorID) {
            var el = document.getElementById(selectorID); 
            el.parentNode.removeChild(el);
        },
        

        getDOMStrings: function(){
            
            return DOMstrings;

        },

        // clear input fields after each input
        clearFields: function() {
            var fields, fieldsArray;

            // querySelectorAll give a list
            fields = document.querySelectorAll(DOMstrings.inputDescription + ',' + DOMstrings.inputValue);
            // convert list to array
            fieldsArray = Array.prototype.slice.call(fields);

            fieldsArray.forEach(function(current, index, array) {
                current.value = '';
            });

            fieldsArray[0].focus();
        },

        displayBudget: function(obj) {
            
            var type;
            obj.budget >= 0 ? type = 'income' : type = 'expense'; 
            
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalIncome, 'income');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExpense, 'expense');
            
            if(obj.percentage > 0){
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            }
            else{
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }

        },

        displayPercentages: function(percentages){
            var fields;
            
            fields = document.querySelectorAll(DOMstrings.expensesPercentageLabel);

            
            // call the above function with callback function
            nodeListForEach(fields, function(current, index){
                
                if(percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                }
                else{
                    current.textContent = '---';
                }

            });
            
            // fieldsArray = Array.prototype.slice.call(fields);
        },

        displayMonth: function(){
            var now, year, month;
            now = new Date();

            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October','November', 'December'];
            month = now.getMonth();
            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ', ' + year;
        },

        changedType: function(){
           
            var fields;      
            fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue);

            nodeListForEach(fields, function(cur){
                cur.classList.toggle('red-focus');
            });

        }

    }

})();

// Global App Controller
var controller = (function(budgetCtrl, UICtrl){

    var setupEventListeners = function(){

        var DOM = UICtrl.getDOMStrings();

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function(event){
            if(event.keyCode === 13 || event.which === 13){
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);

    };

    var updateBudget = function(){

        // Calculate budget
        budgetCtrl.calculateBudget();

        // return budget
        var budget = budgetCtrl.getBudget();

        // display budget on UI
        UICtrl.displayBudget(budget);
         
    };

    var updatePercentages = function() {

        var percentages;
        // calculate percenatges
        budgetCtrl.calculatePercentages();

        // read percentage from budget contoller
        percentages = budgetCtrl.getPercentages();

        // update ui new percentages
        UICtrl.displayPercentages(percentages);
    };
    
    var ctrlAddItem = function(){

        var input, newItem;
        // Get field input data
        input = UICtrl.getInput();

        if(input.description !== '' && !isNaN(input.value) && input.value > 0){
            // Add item to budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // Add item to UI
            UICtrl.addListitem(newItem, input.type);

            // Clear the fields
            UICtrl.clearFields();

            //calculate and update budget
            updateBudget();

            // calculate and update percentages
            updatePercentages();    
        }


    };

    var ctrlDeleteItem = function(event) {
        var itemID, splitID, type, ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;  

        if(itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // delete item from data structure
            budgetCtrl.deleteItem(type, ID);

            // delete from ui
            UICtrl.deleteListItem(itemID);

            // update and shoe in UI
            updateBudget();

            // update percentages
            updatePercentages();

        }

    };

    return {
        init: function() {
            console.log('Application Started');
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalIncome: 0,
                totalExpense: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    };
    
})(budgetController, UIController);

controller.init();

