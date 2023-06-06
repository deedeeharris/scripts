(function() {
  const nameRegex = /לתלמיד: ([^<]+)/;
  const sourceCode = document.documentElement.innerHTML;
  const nameMatches = sourceCode.match(nameRegex);
  let name = '';

  if (nameMatches && nameMatches.length > 0) {
    name = nameMatches[1];
  }

  const tableElements = document.querySelectorAll(
    'table[width="100%"][border="0"][cellspacing="1"][cellpadding="2"][dir="ltr"]'
  );
  let totalCreditPointsWithGrades = 0;
  let totalCreditPointsWithoutGrades = 0;
  let totalRegisteredCourses = 0;

  if (tableElements.length > 0) {
    tableElements.forEach(function(tableElement) {
      const rows = tableElement.getElementsByTagName('tr');
      for (let i = 1; i < rows.length; i++) {
        const cells = rows[i].getElementsByTagName('td');
        const grade = cells[3].innerText.trim();
        const creditPoints = parseFloat(cells[4].innerText.trim());
        const registeredCourses = parseInt(cells[5].innerText.trim());

        if (!isNaN(creditPoints)) {
          if (grade !== '') {
            totalCreditPointsWithGrades += creditPoints;
          } else {
            totalCreditPointsWithoutGrades += creditPoints;
          }
        }

        if (!isNaN(registeredCourses)) {
          totalRegisteredCourses += registeredCourses;
        }
      }
    });

    const total = totalCreditPointsWithGrades + totalCreditPointsWithoutGrades;
	const selectElement = document.querySelector('select[name="yearsafa"]');
	const selectedYear = selectElement.value;


    message = 'Hey ' + name + ',\n\n';
    message += 'Total Credit Points for ' + selectedYear + ':\n';
    message += 'With Grades: ' + totalCreditPointsWithGrades + '\n';
    message += 'Without Grades: ' + totalCreditPointsWithoutGrades + '\n';
    message += 'Total Registered Courses: ' + total + '\n\n';
	message += 'Good luck! \nYedidya Harris';
    alert(message);
  } else {
    console.log('No tables found.');
  }
})();
