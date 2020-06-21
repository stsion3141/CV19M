// destroy用デコイ
var pn_cv = [0, 0, 0];
var w2v_cv = [0, 0, 0];
var CVTgraph = 0;
var words_graph_data = 0;

// Data Creator
{
  // date
  function dateConverter(d){
    return `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`.replace(/\n|\r/g, '');
  }
  // words_graph
  function words_graph(data){
    // canvas create
    let height = $('.canvas_controll').height();
    let width = $('.canvas_controll').width();
    $('.canvas_controll').html('<canvas id="words_cv" width=' + width + ' height=' + height + '></canvas>');

    words_graph_data = data;

    let words_cv = document.getElementById("words_cv").getContext("2d");
    // label
    data['words']['words']['words_cv']["options"]['tooltips']['callbacks']['label'] = function(tooltipItems, data){
      return [
        "感染者数: " + data.datasets[0]['data'][tooltipItems.index],
        "総出現語数: " + data.datasets[1]['data'][tooltipItems.index],
        "異なり語数: " + data.datasets[2]['data'][tooltipItems.index] + " / " + Math.round(data.datasets[3]['data'][tooltipItems.index] * 100) / 100 +"%"
      ]
    };
    // 左軸設定
    data['words']['words']['words_cv']["options"]['scales']['yAxes'][0]['ticks'] = {'callback': function(label, index, labels){
      return label / 1000 + "k";
    }};
    // 右軸設定
    data['words']['words']['words_cv']["options"]['scales']['yAxes'][1]['ticks'] = {'callback': function(label, index, labels){
      return label + "%";
    }};
    // グラフ変形
    {
      // 軸変更
      data['words']['words']['words_cv']['data']['datasets'][0]['backgroundColor'] = 'rgb(227, 227, 227)';
      data['words']['words']['words_cv']['data']['datasets'][0]['yAxisID'] = "y_3";
      data['words']['words']['words_cv']['data']['datasets'][2]['yAxisID'] = "y_2";
      data['words']['words']['words_cv']['data']['datasets'][2]['hidden'] = true;
      // 軸設定変更
      data['words']['words']['words_cv']['options']['scales']['yAxes'].push({"id": "y_3", "display": false, 'type': "linear"});
      // データ変形
      let pardata = [];
      for (var i = 0; i < data['words']['words']['words_cv']['data']['datasets'][2]['data'].length; i++) {
         pardata.push(data['words']['words']['words_cv']['data']['datasets'][2]['data'][i] / data['words']['words']['words_cv']['data']['datasets'][1]['data'][i] * 100);
      };
      data['words']['words']['words_cv']['data']['datasets'].push({"label": "異なり語数(%)", 'type': 'line', 'data': pardata, "borderColor": "#AAB6FB", "pointBackgroundColor": "#AAB6FB", "pointBorderColor": "#AAB6FB", "fill": false, "yAxisID": "y_2", "order": 2});
      data['words']['words']["words_cv"]['options']['tooltips']['displayColors'] = false;
    }
    let words_graph = new Chart(words_cv, data['words']['words']['words_cv']);
  };

  $(window).on('resize', function(){
    //リサイズ時の処理
    words_graph(words_graph_data);
  });

  // ^graoh data
  function dataChanger(data, mode){
    // WORD
    {
      // words_pn
      d = {0: 'count', 1:'count_unk'}
      $('.words_pn').eq(mode).children('.uk-text-lead').each(function(i, e){
          $(this).text(data['words']['words']['words_pn'][d[i]]);
      });

      // count
      html = "";
      for (var i = 0; i < data['words']['count'].length; i++) {
        html += "<tr><td>" + String(i + 1) + "</td><td>" + data['words']['count'][i]['原形'] + "</td><td>" + data['words']['count'][i]['品詞'] + "</td><td>" + data['words']['count'][i]['出現回数'] + "</td></tr>";
      }
      $('.wt').eq(mode).html(html);

      $('.wc').eq(mode).children('a').attr({'href': "./img/" + data['words']['wc']});
      $('.wc').eq(mode).find('img').attr({'data-src': "./img/" + data['words']['wc']});
    }

    // ENTITIES
    {
      // trend
      html = ""
      for (var i = 0; i < data['entities']['trend'].length; i++) {
      html += "<div>" + data['entities']['trend'][i] + "</div>";
      }
      $('.trend').eq(mode).html(html);

      // url
      html = "";
      for (var i = 0; i < data['entities']['url'].length; i++) {
        html += "<tr><td>" + String(i + 1) + "</td><td>" + data['entities']['url'][i]['domain'] + "</td><td>" + data['entities']['url'][i]['count'] + "</td><td>" + Math.round(data['entities']['url'][i]['vertified_count'] / data['entities']['url'][i]['count'] * 100) / 100 + "</td></tr>";
      }
      $('.url').eq(mode).html(html);

      // hashtag
      html = "";
      for (var i = 0; i < data['entities']['hashtag'].length; i++) {
        html += "<tr><td>" + String(i + 1) + "</td><td>" + data['entities']['hashtag'][i]['text'] + "</td><td>" + data['entities']['hashtag'][i]['count'] + "</td><td>" + Math.round(data['entities']['hashtag'][i]['vertified_count'] / data['entities']['hashtag'][i]['count'] * 100) / 100 + "</td></tr>";
      }
      $('.hash').eq(mode).html(html);
    }

    // Mode限定のとき
    // Index対応辞書
    idxdict = {0: 'infected', 1: 'tweet', 2: 'vocabulary'}
    if(mode == 2){ // Adataはここしか持ってないので書き換え
      $('.Adata').each(function(index, elem){
        $(this).children('.uk-text-lead').text(data['home']['Adata'][idxdict[index]]['count']);
        $(this).children('.uk-article-meta').text(data['home']['Adata'][idxdict[index]]['period']);
      });
    }else if (mode == 0) { // overviewのCVTgraph_pn
      $('.CVTgraph_pn').children('.uk-text-lead').each(function(index, elem){
        d = data['home']['overview']['CVTgraph_pn'][idxdict[index]];
        $(this).text(String(d['day']) + ' / ' + d['week']);
      });
      $('.acqdate').html(data['home']['overview']['acqdate']);
    };
  };

  function createGraph(data, date, mode){
    if (pn_cv[mode] != 0) {
      pn_cv[mode].destroy();
      w2v_cv[mode].destroy();
    }

    // pn
    {
      let cv = document.getElementsByClassName('PN_cv')[mode].getContext('2d');
      // tooltip
      data['words']['posi-nega']["options"]['tooltips']['callbacks']['label'] = function(tooltipItems, data){
        let label = ['positive', 'neutral', "negative"];
        let sum = 0;
        data.datasets[0]['data'].forEach(d => {
          sum += d;
        });
        return label[tooltipItems.index] + ": " + data.datasets[0]['data'][tooltipItems.index] + " / " + Math.round(data.datasets[0]['data'][tooltipItems.index] / sum * 100) + "%";
      };
      // canvas
      pn_cv[mode] = new Chart(cv, data['words']['posi-nega']);
    }

    // w2v
    {
      let cv = document.getElementsByClassName('w2v_cv')[mode].getContext('2d');
      // tooltip
      data['words']['w2v']['options']['tooltips']['callbacks']['title'] = function(tooltipItems, d){
        return data['words']['w2v']['tooltips']['title'][tooltipItems[0].datasetIndex][tooltipItems[0].index];
      };
      data['words']['w2v']['options']['tooltips']['callbacks']['label'] = function(tooltipItems, d){
        let aftLabel = data['words']['w2v']['tooltips']['afterLabel'][tooltipItems.datasetIndex][tooltipItems.index].split('<br>');
        return ["x: " + Math.round(tooltipItems.xLabel * 100) / 100 + ", y: " + Math.round(tooltipItems.yLabel * 100) / 100 + ", 出現: " + d['datasets'][tooltipItems.datasetIndex]['data'][tooltipItems.index]['c'], "", "類似単語："].concat(aftLabel);
      };
      data['words']['w2v']['options']['tooltips']['displayColors'] = false;
      data['words']['w2v']['options']['tooltips']['callbacks']['afterLabel'] = function(tooltipItems, d){
        return
      };
      // canvas
      w2v_cv[mode] = new Chart(cv, data['words']['w2v']);
    }

    if (mode == 2) {
      // CVTgraph_cvとwords_cvはここの管轄
      // CVTgraph
      {
        if (CVTgraph != 0) {
          CVTgraph.destroy()
        }
        let CVTgraph_cv = document.getElementById("CVTgraph_cv").getContext("2d");
        data['home']['overview']['CVTgraph_cv']["options"]['tooltips']['callbacks']['label'] = function(tooltipItems, data){
          if(tooltipItems.datasetIndex == 0){
            return "感染者数：" + String(tooltipItems.value);
          }else{
            return "ツイート数：" + String(tooltipItems.value);
          }
        };
        let date_label = `${(date.getMonth()+1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`.replace(/\n|\r/g, '');

        // 非存在データの置き換え
        for (var i = 0; i < data['home']['overview']['CVTgraph_cv']['data']['datasets'][1]['data'].length; i++) {
          if (data['home']['overview']['CVTgraph_cv']['data']['datasets'][1]['data'][i] == 0) {
            data['home']['overview']['CVTgraph_cv']['data']['datasets'][1]['data'][i] = NaN;
          };
        };

        // 今日の日付の色を変更
        for (var i = 0; i < data['home']['overview']['CVTgraph_cv']['data']['labels'].length; i++) {
          if (data['home']['overview']['CVTgraph_cv']['data']['labels'][i] == date_label) {
            data['home']['overview']['CVTgraph_cv']['data']['datasets'][0]['backgroundColor'][i] = "#FB7B8E"
          } else{
            data['home']['overview']['CVTgraph_cv']['data']['datasets'][0]['backgroundColor'][i] = "rgb(227, 227, 227)";
          };
        };
        CVTgraph = new Chart(CVTgraph_cv, data['home']['overview']['CVTgraph_cv']);
      };

      // words_graph
      words_graph(data);
    };
  };

  // data bridge
  function jsonBridge(data, date, mode){
    createGraph(data, date, mode);
    dataChanger(data, mode);

    // Tableの変更
    page = 1;
    $('.wt').each(function(idx, elem){
      $(elem).children('tr').each(function(tidx, telem){
        if ((tidx>=(page-1)*10) && (tidx<page*10)) {
          // 効果範囲内の時
          $(telem).show();
        } else {
          // 効果範囲外の時
          $(telem).hide();
        };
      });
    });
  };

  // Bridge
  function canvasBridge(date){
    let today = dateConverter(date);
    let tomorrow = dateConverter(new Date(date.setDate(date.getDate() + 1)));
    date.setDate(date.getDate() - 1);
    let day = date.getDay();
    let p_sunday = dateConverter(new Date(date.setDate(date.getDate() - date.getDay())));
    let n_sunday = dateConverter(new Date(date.setDate(date.getDate() + 7)));
    date.setDate(date.getDate() + day - 7);


    fn = String(`./json/${today}_${tomorrow}_cv19m.json`);
    $.getJSON(fn, function(d){
      jsonBridge(d, date, 0);
    });

    fn = String(`./json/${p_sunday}_${n_sunday}_cv19m.json`);
    $.getJSON(fn, function(d){
      jsonBridge(d, date, 1);
    });

    $.getJSON('./json/all_cv19m.json', function(d){
      jsonBridge(d, date, 2);
    });

  };
}

// tab_graph_controller
{
  UIkit.util.on('.main_tab', 'beforeshow', function(e){
  });
}

// Flatpickr
{
  let today = new Date(2020, 5, 18);
  // Flatpickerの読み込み
  let fp = flatpickr('.flatpickr', {
    defaultDate: today,
    minDate: new Date(2020, 2, 29),
    maxDate: today,
    "onClose": function(selectedDates, dateStr, instance){
      $(".flatpickr").val(this.formatDate(selectedDates[0], 'Y-m-d'));
    },
    "onChange": function(selectedDates, dateStr, instance){
      canvasBridge(selectedDates[0]);
    },
    "onMonthChange": function(selectedDates, dateStr, instance){
      $(".flatpickr").val(this.currentYear + "-" + (this.currentMonth + 1) +  this.formatDate(selectedDates[0], '-d'));
    }
  });

  // レイアウトの調整
  $(".numInputWrapper").css('display', 'none');
  $(".flatpickr-monthDropdown-months").css('display', 'none');

  // キャンバスの初期化
  canvasBridge(fp.selectedDates[0]);
}

// count controller_host
{
  $('#count_host_controller').find('a').on('click', function(e){
    // 表示するページを設定
    let page = Number($(this).closest('ul').find('.uk-active').text());
    if ($(this).children('.prev')[0] != undefined) {
      if(page != 1){
        page -= 1;
      };
    }else if($(this).children('.next')[0] != undefined){
      if (page != 10) {
        page += 1;
      };
    }else{
      page = Number($(this).html());
    };

    $('.mpage').html(page);

    // activeの変更
    $('#count_host_controller').children('li').removeClass('uk-active');
    $('#count_host_controller').children('li').each(function(idx, elem){
      if (Number($(elem).children('a').text()) == page) {
        $(elem).addClass('uk-active');
      };
    });

    // Tableの変更
    $('.wt').each(function(idx, elem){
      $(elem).children('tr').each(function(tidx, telem){
        if ((tidx>=(page-1)*10) && (tidx<page*10)) {
          // 効果範囲内の時
          $(telem).show();
        } else {
          // 効果範囲外の時
          $(telem).hide();
        };
      });
    });
  });
}

// mini table controller
{
  $('.mpage').html(1);

  function setmtable(page, table){
    console.log(page,table);
    $(table).children('tbody').children('tr').each(function(tidx, telem){
      if ((tidx>=(page-1)*10) && (tidx<page*10)) {
        // 効果範囲内の時
        $(telem).show();
      } else {
        // 効果範囲外の時
        $(telem).hide();
      };
    });
  };

  $('.mprev').on('click', function(e){
    let mpage = $(this).closest('.uk-pagination').children('.mpage');
    if ($(mpage).html() != '1') {
      $(mpage).html(Number($(mpage).html()) - 1);
      setmtable(Number($(mpage).html()), $(this).closest('.uk-pagination').prev('div').children('table'));
    };
  });
  $('.mnext').on('click', function(e){
    let mpage = $(this).closest('.uk-pagination').children('.mpage');
    if ($(mpage).html() != '10') {
      $(mpage).html(Number($(mpage).html()) + 1);
      setmtable(Number($(mpage).html()), $(this).closest('.uk-pagination').prev('div').children('table'));
    };
  });
}

// dwa(day-week-all) controller
{
  $('.dwacontroll').find('.dwatab').each(function(idx, elem){
    $(this).children('li').first().show();
  });
  $('.dwaswicher').each(function(idx, elem){
    $(this).children('li').first().addClass('uk-active');
  });
  $('.dwaswicher').find('a').on('click', function(e){
    let pushed = $(this).text();
    let swicher = $(this).closest('.dwaswicher');
    $(this).parents('.dwacontroll').find('.dwatab').children('li').each(function(idx, elem){
      if (pushed == 'DAILY' && idx == 0) {
        $(elem).show();
        $(swicher).children('li').eq(idx).addClass('uk-active');
      }else if (pushed == 'WEEKLY' && idx == 1) {
        $(elem).show();
        $(swicher).children('li').eq(idx).addClass('uk-active');
      }else if (pushed == 'ALL' && idx == 2) {
        $(elem).show();
        $(swicher).children('li').eq(idx).addClass('uk-active');
      }else {
        $(elem).hide();
        $(swicher).children('li').eq(idx).removeClass('uk-active');
      };
    });
  });
}

// alink無効化
{
  $(function(){
    $('a').click(function(event){
      event.preventDefault();
    });
  });
}

// 注意事項表示
UIkit.modal($('#readme')).show();
