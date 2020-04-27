$(document).ready(function(){

    fetch(`https://api.covid19api.com/summary`)
    .then((response1) => {
      return response1.json();
    })
    .then((data1) => {
      result={}
      result['NewConfirmed']=data1.Global.NewConfirmed;
      result['TotalConfirmed']=data1.Global.TotalConfirmed;
      result['NewDeaths']=data1.Global.NewDeaths;
      result['NewRecovered']=data1.Global.NewRecovered;
      result['TotalRecovered']=data1.Global.TotalRecovered;
  
    $('#globalSummary').html(`
      <ul><h4>${$('#globalSummary').text()}</h4>
        <li>New Confirmed Cases: ${result['NewConfirmed'].toLocaleString()}</li>
        <li>Total Confirmed Cases: ${result['TotalConfirmed'].toLocaleString()}</li>
        <li>New Deaths: ${result['NewDeaths'].toLocaleString()}</li>
        <li>New Recovered Cases: ${result['NewRecovered'].toLocaleString()}</li>
        <li>Total Recovered Cases: ${result['TotalRecovered'].toLocaleString()}</li>
      </ul>`)
    });
  
  fetch('https://newsapi.org/v2/top-headlines?q=covid-19&from=2020-04-27&sortBy=popularity&apiKey=5a45e2dfd22f412fbdbc3139ce8d3b37')
      .then((response2) => {
        return response2.json();
      })
      .then((data2) => {
          console.log(data2)
  
          article1={}
          article1['sourceName']=data2.articles[0].source.name;
          article1['author']=data2.articles[0].author;
          article1['title']=data2.articles[0].title;
          article1['image']=data2.articles[0].urlToImage
          console.log(article1)
  
          article2={}
          article2['sourceName']=data2.articles[0].source.name;
          article2['author']=data2.articles[0].author;
          article2['title']=data2.articles[0].title;
          article2['image']=data2.articles[0].urlToImage
          console.log(article2)
  
          article3={}
          article3['sourceName']=data2.articles[0].source.name;
          article3['author']=data2.articles[0].author;
          article3['title']=data2.articles[0].title;
          article3['image']=data2.articles[0].urlToImage
          console.log(article3)
      })
  
  });
  
  