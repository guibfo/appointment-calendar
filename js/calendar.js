class Calendar {
  constructor() {
    const self = this;
    this.date = new Date();
    this.currentMonth = this.date.getMonth();
    this.currentYear = this.date.getFullYear();
    this.currentDayFormatted = `${this.currentYear}-${this.currentMonth + 1}-${this.date.getDate()}`;
    this.weekDays = ['S','M','T','W','T','F','S'];
    this.monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December'
    ];
    this.init(self);
  }

  // Setup the calendar
  init(self) {
    const wrapper = document.getElementById('calendar');
    const headerWrapper = document.createElement('DIV');
    headerWrapper.setAttribute('class', 'header-wrapper');
    wrapper.appendChild(headerWrapper);

    // Creates and appends previous month control
    const controlPrev = document.createElement('DIV');
    controlPrev.setAttribute('class', 'previous-month arrow');
    controlPrev.innerHTML = '<';
    headerWrapper.appendChild(controlPrev);

    // Creates and appends month - year header
    const header = document.createElement('DIV');
    header.setAttribute('id', 'calendar-header');
    headerWrapper.appendChild(header);

    // Creates and appends next month control
    const controlNext = document.createElement('DIV');
    controlNext.setAttribute('class', 'next-month arrow');
    controlNext.innerHTML = '>';
    headerWrapper.appendChild(controlNext);

    // Creates and appends calendar grid
    const grid = document.createElement('TABLE');
    grid.setAttribute('id', 'calendar-grid');
    wrapper.appendChild(grid);

    //Creates and appends day overview
    const panel = document.createElement('DIV');
    panel.setAttribute('class', 'day-overview');
    wrapper.appendChild(panel);

    const panelHeader = document.createElement('HEADER');
    panelHeader.setAttribute('class', 'day-overview-header');
    panel.appendChild(panelHeader);

    const panelBody = document.createElement('DIV');
    panelBody.setAttribute('class', 'day-overview-body');
    panel.appendChild(panelBody);

    // Initializes month - year header
    this.setMonthYear(self.currentMonth, self.currentYear);

    // Initializes days of the week header
    this.setWeekDays(self.weekDays);

    // Initializes calendar grid with current month
    this.fillCalendar(self.currentMonth, self.currentYear);

    // Sets class for current day
    this.setCurrentDay(self.currentDayFormatted);

    // Setup controls navigation
    controlNext.addEventListener('click', function() {
      self.changeMonth('next');
    });

    controlPrev.addEventListener('click', function() {
      self.changeMonth('previous');
    });

    // Setting up day overview
    const message = document.createElement('DIV');
    message.setAttribute('class', 'day-overview-description');
    document.querySelector('.day-overview-body').appendChild(message);

    this.overviewHeaderHandler(this.currentDayFormatted);
    this.dayClickHandler(this.currentDayFormatted);
  }

  // Set month - year header
  setMonthYear(month, year) {
    document.getElementById('calendar-header').innerHTML = `${this.monthNames[month]} - ${year}`;
  }

  // Set week days header
  setWeekDays(days) {
    const header = document.createElement('THEAD');
    header.setAttribute('id', 'week-days-header');
    document.getElementById('calendar-grid').appendChild(header);

    const row = document.createElement('TR');
    document.getElementById('week-days-header').appendChild(row);

    days.forEach((element) => {
      const column = document.createElement('TH');
      column.innerHTML = element;
      row.appendChild(column);
    });
  };

  // Fill current month view with days
  fillCalendar(month, year) {
    let firstDay = this.getFirstDay(month, year);
    let totalDays = this.getDaysInMonth(month, year);
    let day = 1;

    const body = document.createElement('TBODY');
    document.getElementById('calendar-grid').appendChild(body);

    while (day <= totalDays) {
      const row = document.createElement('TR');
      for (let i = 0; i < 7; i++) {
        const column = document.createElement('TD');
        if (day > totalDays) {
          row.appendChild(column);
          continue;
        }
        if (firstDay > i) {
          row.appendChild(column);
        }
        else {
          column.dataset.date = `${year}-${month+1}-${day}`;
          column.innerHTML = day;
          row.appendChild(column);
          day++;
        }
      }
      firstDay = 0;
      body.appendChild(row)
    }

    this.bindClickHandler();
  }

  // Get day of the week month starts
  getFirstDay(month, year) {
    return new Date(`${year}-${month+1}-01`).getDay() + 1;
  }

  // Get month number of days
  getDaysInMonth(month, year) {
    return new Date(year, month+1, 0).getDate();
  }

  // Sets class for current day
  setCurrentDay(currentDay) {
    if (document.querySelector(`[data-date="${currentDay}"]`)) {
      const day = document.querySelector(`[data-date="${currentDay}"]`);
      day.setAttribute('class', 'current selected');
    }
  }

  // Change month handler
  changeMonth(action) {
    const body = document.querySelector('#calendar-grid > tbody');
    document.getElementById('calendar-grid').removeChild(body);

    switch(action) {
      case 'next':
        if (this.currentMonth === 11) {
          this.currentMonth = 0;
          this.currentYear++;
        } else {
          this.currentMonth++;
        }
        break;
      case 'previous':
        if (this.currentMonth === 0) {
          this.currentMonth = 11;
          this.currentYear--;
        } else {
          this.currentMonth--;
        }
        break;
    }

    this.fillCalendar(this.currentMonth, this.currentYear);
    this.setMonthYear(this.currentMonth, this.currentYear);
    this.setCurrentDay(this.currentDayFormatted);
  }

  // Binds day click event
  bindClickHandler() {
    const days = document.querySelectorAll('[data-date]');
    days.forEach((day) => {
      day.addEventListener('click', (event) => {
        const fullDate = day.dataset.date;
        this.dayClickHandler(fullDate);
        if (document.querySelector('.selected')) {
          document.querySelector('.selected').classList.remove('selected');
        }
        event.target.classList.add('selected');
      });
    });
  }

  // Change day overview
  dayClickHandler(date) {
    this.overviewHeaderHandler(date);

    if (localStorage.getItem(date) === null) {
      document.querySelector('.day-overview-description').innerHTML = 'You don\'t have an appointment today!';

      this.removeDeleteButton();
      this.removeEditButton();
      this.setScheduleButton(date);
    } else {
      // Remove schedule button
      if (document.querySelector('.btn-schedule')) {
        var button = document.querySelector('.btn-schedule');
        document.querySelector('.btn-schedule').parentNode.removeChild(button);
      }

      // Set appointment's description
      const description = JSON.parse(localStorage.getItem(date));
      document.querySelector('.day-overview-description').innerHTML = description.description;

      // Add edit button
      this.setEditButton(date);

      // Add delete button
      this.setDeleteButton(date);
    }
  }

  // Change the overview header based on clicked day
  overviewHeaderHandler(date) {
    const splitDate = date.split('-');
    const formattedMonth = this.monthNames[splitDate[1]-1].substring(0,3);
    const formattedDate = `${formattedMonth} - ${splitDate[2]} | ${splitDate[0]}`;
    document.querySelector('.day-overview-header').innerHTML = formattedDate;
  }

  setScheduleButton(date) {
    // Remove schedule button in case it already exists
    this.removeScheduleButton();

    // Don't show schedule button when past date
    const today = new Date();
    const splitDate = date.split('-');
    const clickedDate = new Date(splitDate[0], splitDate[1]-1, splitDate[2]);
    if (!(clickedDate < today) || clickedDate.toDateString() === today.toDateString()) {
      const scheduleButton = document.createElement('BUTTON');
      scheduleButton.setAttribute('class', 'btn btn-schedule');
      scheduleButton.innerHTML = 'Schedule';
      scheduleButton.addEventListener('click', () => {
        this.scheduleClickHandler(date);
      });
      document.querySelector('.day-overview-body').classList.remove('has-event');
      document.querySelector('.day-overview-body').appendChild(scheduleButton);
    }
  }

  removeScheduleButton() {
    if (document.querySelector('.btn-schedule')) {
      const scheduleButton = document.querySelector('.btn-schedule');
      document.querySelector('.btn-schedule').parentNode.removeChild(scheduleButton);
    }
  }

  scheduleClickHandler(date) {
    const description = {description: prompt('What is your appointment?', '')}
    if (description.description.trim().length === 0) {
      alert('A description is required for your appointment');
      return;
    } else {
      localStorage.setItem(date, JSON.stringify(description));
      this.dayClickHandler(date);
    }
  }

  setEditButton(date) {
    //Remove edit button in case it already exists
    this.removeEditButton();

    const today = new Date();
    const splitDate = date.split('-');
    const clickedDate = new Date(splitDate[0], splitDate[1]-1, splitDate[2]);
    if (!(clickedDate < today) || clickedDate.toDateString() === today.toDateString()) {
      const editButton = document.createElement('BUTTON');
      editButton.setAttribute('class', 'btn btn-edit');
      editButton.innerHTML = 'Edit';
      editButton.addEventListener('click', () => {
        this.editClickHandler(date);
      });
      document.querySelector('.day-overview-body').classList.add('has-event');
      document.querySelector('.day-overview-body').appendChild(editButton);
    }
  }

  removeEditButton() {
    if (document.querySelector('.btn-edit')) {
      const editButton = document.querySelector('.btn-edit');
      document.querySelector('.btn-edit').parentNode.removeChild(editButton);
    }
  }

  editClickHandler(date) {
    const description = {description: prompt('What is your appointment?', '')}
    if (description.description.trim().length === 0) {
      alert('A description is required for your appointment');
      return;
    } else {
      localStorage.setItem(date, JSON.stringify(description));
      this.dayClickHandler(date);
    }
  }

  setDeleteButton(date) {
    //Remove delete button in case it already exists
    this.removeDeleteButton();

    const today = new Date();
    const splitDate = date.split('-');
    const clickedDate = new Date(splitDate[0], splitDate[1]-1, splitDate[2]);
    if (!(clickedDate < today) || clickedDate.toDateString() === today.toDateString()) {
      const deleteButton = document.createElement('BUTTON');
      deleteButton.setAttribute('class', 'btn btn-delete');
      deleteButton.innerHTML = 'Delete';
      deleteButton.addEventListener('click', () => {
        this.deleteClickHandler(date);
      });
      document.querySelector('.day-overview-body').appendChild(deleteButton);
    }
  }

  removeDeleteButton() {
    if (document.querySelector('.btn-delete')) {
      const deleteButton = document.querySelector('.btn-delete');
      document.querySelector('.btn-delete').parentNode.removeChild(deleteButton);
    }
  }

  deleteClickHandler(date) {
    let confirmation = confirm('Delete appointment?');
    if (confirmation) {
      localStorage.removeItem(date);
    }
    this.dayClickHandler(date);
  }
}

let calendar = new Calendar();
