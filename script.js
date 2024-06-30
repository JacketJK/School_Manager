document.querySelector('.btn-main-sidebar').addEventListener('click', () => {
  const sidebar = document.querySelector('.sidebar-manu');
  const icon = document.querySelector('.btn-main-sidebar i');
  
  sidebar.classList.toggle('expanded');

  if (sidebar.classList.contains('expanded')) {
    icon.classList.replace('bi-grid', 'bi-list-ul');
  } else {
    icon.classList.replace('bi-list-ul', 'bi-grid');
  }
});

document.addEventListener('DOMContentLoaded', function() {
  document.querySelector('.dropbtn').addEventListener('click', function() {
      document.querySelector('.dropdown-content').classList.toggle('show');
  });

  window.onclick = function(event) {
      if (!event.target.matches('.dropbtn')) {
          var dropdowns = document.getElementsByClassName("dropdown-content");
          for (var i = 0; i < dropdowns.length; i++) {
              var openDropdown = dropdowns[i];
              if (openDropdown.classList.contains('show')) {
                  openDropdown.classList.remove('show');
              }
          }
      }
  }
});


const buttons = document.querySelectorAll('.btn-center-nav');
buttons.forEach(button => {
  button.addEventListener('click', () => {
    buttons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
  });
});

const btnhw = document.querySelectorAll('.btn-home-work');
btnhw.forEach(button => {
  button.addEventListener('click', () => {
    btnhw.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
  });
});

document.addEventListener('DOMContentLoaded', () => {
  chart_time_study();
  chart_result_study();
  updateTime();
});

const chart_time_study = () => {
  var options = {
    series: [67],
    chart: {
      height: 500,
      type: 'radialBar',
      offsetY: 20,
      fontFamily: 'Prompt, sans-serif'
    },
    plotOptions: {
      radialBar: {
        startAngle: -135,
        endAngle: 135,
        dataLabels: {
          name: {
            fontSize: '16px',
            color: '#000000', 
            offsetY: 120
          },
          value: {
            offsetY: 76,
            fontSize: '22px',
            color: '#000000', 
            formatter: function (val) {
              return val + "%";
            }
          }
        }
      }
    },
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'dark',
        shadeIntensity: 0.15,
        inverseColors: false,
        opacityFrom: 1,
        opacityTo: 1,
        stops: [0, 50, 65, 91]
      }
    },
    stroke: {
      dashArray: 4,
      colors: ['#000000'] 
    },
    labels: ['ภาคเรียนที่ 2/2567'],
    colors: ['#000000'] 
  };

  var chart = new ApexCharts(document.querySelector("#chart_time_study"), options);
  chart.render();
}

const chart_result_study = () => {
  var options = {
    series: [{
      name: 'ภาคเรียนที่ 1/2567',
      data: [66, 83, 78, 65, 80]
    }, {
      name: 'ภาคเรียนที่ 2/2567',
      data: [50, 52, 45, 32, 60]
    }],
    chart: {
      height: 400,
      type: 'area',
      fontFamily: 'Prompt, sans-serif',
      offsetY: 20,
    },
    colors: ['#000000', '#444444'], 
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: 'smooth',
      colors: ['#000000'] 
    },
    xaxis: {
      type: 'text',
      offsetY: 0,
      categories: ["ภาษาไทย", "คณิตศาสตร์", "ภาษาอังกฤษ", "วิทยาศาสตร์", "สังคมศึกษา"],
      labels: {
        style: {
          colors: '#000000', 
          fontFamily: 'Prompt, sans-serif'
        }
      },
      axisBorder: {
        show: true,
        color: '#000000' 
      },
      axisTicks: {
        show: true,
        color: '#000000' 
      }
    },
    yaxis: {
      labels: {
        style: {
          colors: '#000000', 
          fontFamily: 'Prompt, sans-serif'
        }
      },
      axisBorder: {
        show: true,
        color: '#000000' 
      },
      axisTicks: {
        show: true,
        color: '#000000' 
      }
    },
    tooltip: {
      theme: 'dark' 
    },
    legend: {
      labels: {
        colors: '#000000', 
        fontFamily: 'Prompt, sans-serif'
      }
    }
  };

  var chart = new ApexCharts(document.querySelector("#chart_result_study"), options);
  chart.render();
}

const updateTime = () => {
  const now = new Date();
  
  const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      hour12: false
  };
  const formattedDateTime = now.toLocaleDateString('th-TH', options);
  document.getElementById('now_today').innerHTML = formattedDateTime;
};
setInterval(updateTime, 1000);
