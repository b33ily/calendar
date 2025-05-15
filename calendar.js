document.addEventListener('DOMContentLoaded', function() {
    // Элементы DOM
    const addButton = document.getElementById('addButton');
    const eventNameInput = document.getElementById('eventName');
    const eventDateInput = document.getElementById('eventDate');
    const eventTimeInput = document.getElementById('eventTime');
    const eventLocationInput = document.getElementById('eventLocation');
    const eventPeopleInput = document.getElementById('eventPeople');
    const generalNotesInput = document.getElementById('generalNotes');
    const saveButton = document.getElementById('saveButton');
    const calendarDaysContainer = document.getElementById('calendarDays');
    const currentMonthElement = document.getElementById('currentMonth');
    const currentYearElement = document.getElementById('currentYear');
    const prevMonthButton = document.getElementById('prevMonth');
    const nextMonthButton = document.getElementById('nextMonth');
    
    // Текущая дата
    let currentDate = new Date();
    let currentMonth = currentDate.getMonth();
    let currentYear = currentDate.getFullYear();
    
    // Инициализация календаря
    function initCalendar() {
        updateMonthYearDisplay();
        generateCalendarDays();
        loadData();
        
        // Устанавливаем текущую дату по умолчанию
        const today = new Date().toISOString().split('T')[0];
        eventDateInput.value = today;
        eventDateInput.min = today;
    }
    
    // Обновление отображения месяца и года
    function updateMonthYearDisplay() {
        const months = [
            'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
            'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
        ];
        
        currentMonthElement.textContent = months[currentMonth];
        currentYearElement.textContent = currentYear;
    }
    
    // Генерация дней календаря
    function generateCalendarDays() {
        calendarDaysContainer.innerHTML = '';
        
        // Получаем первый день месяца и количество дней в месяце
        const firstDay = new Date(currentYear, currentMonth, 1);
        const lastDay = new Date(currentYear, currentMonth + 1, 0);
        const daysInMonth = lastDay.getDate();
        
        // Получаем день недели первого дня месяца (0 - воскресенье, 1 - понедельник и т.д.)
        let firstDayOfWeek = firstDay.getDay();
        if (firstDayOfWeek === 0) firstDayOfWeek = 7; // Делаем воскресенье 7-м днем
        
        // Добавляем пустые ячейки для дней предыдущего месяца
        for (let i = 1; i < firstDayOfWeek; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'day-container';
            calendarDaysContainer.appendChild(emptyDay);
        }
        
        // Добавляем дни текущего месяца
        for (let day = 1; day <= daysInMonth; day++) {
            const dayContainer = document.createElement('div');
            dayContainer.className = 'day-container';
            
            const dayNumber = document.createElement('div');
            dayNumber.className = 'day-number';
            dayNumber.textContent = day;
            
            // Проверяем, является ли день сегодняшним
            const today = new Date();
            if (day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()) {
                dayNumber.style.backgroundColor = 'var(--accent-color)';
                dayNumber.style.color = 'var(--light-color)';
            }
            
            const inputNotes = document.createElement('div');
            inputNotes.className = 'input-notes';
            
            // Создаем 3 поля для заметок на каждый день
            for (let i = 1; i <= 3; i++) {
                const input = document.createElement('input');
                input.className = 'input-note';
                input.type = 'text';
                input.placeholder = `Заметка ${i}`;
                input.dataset.day = day;
                input.dataset.month = currentMonth;
                input.dataset.year = currentYear;
                input.dataset.noteIndex = i;
                inputNotes.appendChild(input);
            }
            
            dayContainer.appendChild(dayNumber);
            dayContainer.appendChild(inputNotes);
            calendarDaysContainer.appendChild(dayContainer);
        }
    }
    
    // Добавление события
    function addEvent() {
        const eventName = eventNameInput.value.trim();
        const eventDate = eventDateInput.value;
        const eventTime = eventTimeInput.value;
        const eventLocation = eventLocationInput.value.trim();
        const eventPeople = eventPeopleInput.value.trim();
        
        if (!eventName || !eventDate) {
            showNotification('Пожалуйста, заполните название события и дату');
            return;
        }
        
        const date = new Date(eventDate);
        const day = date.getDate();
        const month = date.getMonth();
        const year = date.getFullYear();
        
        // Находим соответствующий день в календаре
        const dayInputs = document.querySelectorAll(`.input-note[data-day="${day}"][data-month="${month}"][data-year="${year}"]`);
        
        if (dayInputs.length === 0) {
            showNotification('Выбранная дата не отображается в текущем месяце календаря');
            return;
        }
        
        // Форматируем информацию о событии
        let eventInfo = eventName;
        if (eventTime) eventInfo += ` (${eventTime})`;
        if (eventLocation) eventInfo += ` [${eventLocation}]`;
        if (eventPeople) eventInfo += ` с ${eventPeople}`;
        
        // Ищем первое пустое поле для заметки
        let noteAdded = false;
        for (const input of dayInputs) {
            if (!input.value) {
                input.value = eventInfo;
                noteAdded = true;
                break;
            }
        }
        
        if (!noteAdded) {
            showNotification('Все поля заметок для этого дня уже заполнены. Максимум 3 заметки на день.');
            return;
        }
        
        // Очищаем поля ввода
        eventNameInput.value = '';
        eventDateInput.value = '';
        eventTimeInput.value = '';
        eventLocationInput.value = '';
        eventPeopleInput.value = '';
        
        // Автоматическое сохранение
        saveData();
        showNotification('Событие добавлено и сохранено!');
    }
    
    // Сохранение данных
    function saveData() {
        const data = {
            notes: {},
            generalNotes: generalNotesInput.value,
            currentMonth: currentMonth,
            currentYear: currentYear
        };
        
        // Собираем все заметки
        document.querySelectorAll('.input-note').forEach(input => {
            const day = input.dataset.day;
            const month = input.dataset.month;
            const year = input.dataset.year;
            const noteIndex = input.dataset.noteIndex;
            
            if (!data.notes[`${year}-${month}`]) {
                data.notes[`${year}-${month}`] = {};
            }
            
            if (!data.notes[`${year}-${month}`][day]) {
                data.notes[`${year}-${month}`][day] = {};
            }
            
            data.notes[`${year}-${month}`][day][noteIndex] = input.value;
        });
        
        localStorage.setItem('calendarData', JSON.stringify(data));
    }
    
    // Загрузка данных
    function loadData() {
        const savedData = localStorage.getItem('calendarData');
        if (!savedData) return;
        
        const data = JSON.parse(savedData);
        
        // Восстанавливаем текущий месяц и год
        if (data.currentMonth !== undefined && data.currentYear !== undefined) {
            currentMonth = parseInt(data.currentMonth);
            currentYear = parseInt(data.currentYear);
            updateMonthYearDisplay();
            generateCalendarDays();
        }
        
        // Восстанавливаем общие заметки
        if (data.generalNotes) {
            generalNotesInput.value = data.generalNotes;
        }
        
        // Восстанавливаем заметки по дням
        if (data.notes) {
            for (const [yearMonth, daysData] of Object.entries(data.notes)) {
                const [year, month] = yearMonth.split('-');
                
                for (const [day, notes] of Object.entries(daysData)) {
                    for (const [noteIndex, noteText] of Object.entries(notes)) {
                        const input = document.querySelector(`.input-note[data-day="${day}"][data-month="${month}"][data-year="${year}"][data-note-index="${noteIndex}"]`);
                        if (input) {
                            input.value = noteText;
                        }
                    }
                }
            }
        }
    }
    
    // Переключение месяцев
    function changeMonth(offset) {
        currentMonth += offset;
        
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        } else if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        
        updateMonthYearDisplay();
        generateCalendarDays();
        loadData(); // Загружаем данные для нового месяца
    }
    
    // Показать уведомление
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 500);
        }, 2000);
    }
    
    // Обработчики событий
    addButton.addEventListener('click', addEvent);
    saveButton.addEventListener('click', () => {
        saveData();
        showNotification('Данные сохранены!');
    });
    prevMonthButton.addEventListener('click', () => changeMonth(-1));
    nextMonthButton.addEventListener('click', () => changeMonth(1));
    
    // Автосохранение при изменении общих заметок
    generalNotesInput.addEventListener('input', () => {
        saveData();
    });
    
    // Автосохранение при изменении заметок дня
    document.addEventListener('input', (e) => {
        if (e.target.classList.contains('input-note')) {
            saveData();
        }
    });
    
    // Инициализация календаря
    initCalendar();
});