var app = {};

//    	var QueryString = function () {
//  // This function is anonymous, is executed immediately and 
//  // the return value is assigned to QueryString!
//  var query_string = {};
//  var query = window.location.search.substring(1);
//  var vars = query.split("&");
//  for (var i=0;i<vars.length;i++) {
//    var pair = vars[i].split("=");
//        // If first entry with this name
//    if (typeof query_string[pair[0]] === "undefined") {
//      query_string[pair[0]] = decodeURIComponent(pair[1]);
//        // If second entry with this name
//    } else if (typeof query_string[pair[0]] === "string") {
//      var arr = [ query_string[pair[0]],decodeURIComponent(pair[1]) ];
//      query_string[pair[0]] = arr;
//        // If third or later entry with this name
//    } else {
//      query_string[pair[0]].push(decodeURIComponent(pair[1]));
//    }
//  } 
//    return query_string;
//}();

      	//Date.i18n.setLanguage("en-US");
      	//
      	//var d = moment();
      	//dYear = d.format("YYYY");
      	//dMonth = d.format("MM")
      	//dDay = d.format("DD");
      	//dHour = d.format("HH");
      	//dMinute = d.format("MM");
        
        var tlOptions = {
          scale_factor: 0.75,
          timenav_height_percentage: 10,
          dragging: false,
          trackResize: false,
          track_events: [],
          menubar_height: 50,
          start_at_end: true,
          duration: 200
        }
	
        var tlQuery = "http://btweet.selfhost.eu:17850/timeline/getEvents?";
	
		//if (QueryString.year) {
		//	tlQuery += "year=" + QueryString.year;
		//}else{
		//	tlQuery += "year=" + dYear;
		//}
		//
		//if (QueryString.month) {
		//	tlQuery += "&month=" + QueryString.month;
		//}else{
		//	tlQuery += "&month=" + dMonth;
		//}
		//
		//if(!QueryString.daily){
		//if (QueryString.day) {
		//	tlQuery += "&day=" + QueryString.day;
		//}else{
		//	tlQuery += "&day=" + dDay;
		//}
		//}
		//
		//if (QueryString.hour) {
		//	tlQuery += "&hour=" + QueryString.hour;
		//}else{
		//	tlQuery += "&hour=" + dHour;
		//}
		//
		//if (QueryString.minute) {
		//	tlQuery += "&minute=" + QueryString.minute;
		//}
        
        // initialize input widgets first
        $('#datepairExample .time').timepicker({
            'showDuration': true,
            'timeFormat': 'H:i:s'
        });
    
        $('#datepairExample .date').datepicker({
            'format': 'yyyy-m-d',
            'autoclose': true
        });
    
        // initialize datepair
        var dp = $('#datepairExample').datepair({
          defaultDateDelta: 0,
          defaultTimeDelta: 60000
        });
        
        $( ".events-loader" ).click(function() {
                                
            queryFromInstruction($(this).html());
           
        });
        
        $( ".fireandforget" ).click(function() {
               
            var startEls = $('#datepairExample .start');
            var endEls = $('#datepairExample .end');
            
            var startDate = $(startEls).filter(".date").val()
            var startTime = $(startEls).filter(".time").val()
            var endDate = $(endEls).filter(".date").val()
            var endTime = $(endEls).filter(".time").val()
            
            console.log(startDate + " " + startTime);
            console.log(endDate + " " + endTime);
            
            var start = moment(startDate + " " + startTime, "YYYY-MM-DD HH:mm:ss");
            var end = moment(endDate + " " + endTime,  "YYYY-MM-DD HH:mm:ss");
            
            console.log(start.format("YYYY-MM-DD HH:mm:ss"));
            console.log(end.format("YYYY-MM-DD HH:mm:ss"));
            
            timelineFromUnix(start.unix(), end.unix());
           
        });
        
        
        function queryFromInstruction(instruction) {
            
            var instrArr = instruction.split(" ");
            
            if (instrArr.length < 3) {
            
              console.log("insufficient instruction");
            
            }else{
            
              var iType = instrArr[0];
              var iUotAmount = instrArr[1];
              var iUot = instrArr[2];
              
              
              var to = moment();                
              var from = moment(to).subtract(iUotAmount, iUot);
                          
              timelineFromUnix(from.unix(), to.unix())
              
            }
        }
        
        function timelineFromUnix(min, max) {
            var tq = tlQuery;
            tq += "min=" + min;
            tq += "&max=" + max;
            
            updateTimeline(tq);
        }
        
        function updateTimeline(query) {
          if (query) {
            app = new TL.Timeline('timeline-embed', query, tlOptions); 
          }            
        }
    
        queryFromInstruction("last 5 minute");
    
        //var timeline = new TL.Timeline('timeline-embed', tlQuery); 