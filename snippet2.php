<!-- SAMPLE CODE SHOWCASING AN API I WROTE TO MANAGE USER BADGE ACTIVITY AT A CONFERENCE -->

<?php
	header('Content-Type: text/html; charset=iso-8859-1'); 
    
	//Connect to the Database
	//personal data has been removed
	$con = mysql_connect('DBNAME', 'USER', 'PASS') or die ('MySQL Error.');
	mysql_select_db('DB', $con) or die('MySQL Error.');
	
	date_default_timezone_set('America/Los_Angeles');
	
	
	$rfid = isset($_REQUEST['rfid']) ? $_REQUEST['rfid'] : NULL;
	$user_id = isset($_REQUEST['user_id']) ? $_REQUEST['user_id'] : NULL;
	$first_name = isset($_REQUEST['first_name']) ? $_REQUEST['first_name'] : NULL; 
	$last_name = isset($_REQUEST['last_name']) ? $_REQUEST['last_name'] : NULL;
	$activity_type = isset($_REQUEST['activity_type']) ? $_REQUEST['activity_type'] : NULL;
	$date_selected = isset($_REQUEST['date_selected']) ? $_REQUEST['date_selected'] : NULL;
	$date = isset($_REQUEST['date']) ? $_REQUEST['date'] : NULL;
	if($date != NULL){
		$startDate = date('Y-m-d H:i:s', strtotime($date . ' + 1 month'));
		$endDate = date('Y-m-d H:i:s', strtotime($startDate . ' + 1 day'));
		
	}
	
	$time = date('Y-m-d H:i:s');
	require_once("init_validation.php");
	
	
	if(isset($_REQUEST['method'])){

		// *****************************
		// LOGIN NOT REQUIRED
		// *****************************

		switch($_REQUEST['method']){
			case "get_users_list":
				//return list of all users and info
				$result = mysql_query('SELECT * FROM users ORDER BY `id`', $con);
				//Prepare our output
				$users = array();
				while($user = mysql_fetch_array($result, MYSQL_ASSOC)) {
					$users[] = array('user'=>$user);
				}
				
				if($result != true){
					output(array(
						"api_status"=>"fail",
						"method"=>"get_users_list",
						"message"=>"error getting list of users."
					));
				}
				else{
					 // RETURN SUCCESS TO THE USER
					output(array(	
						"api_status"=>"success",
						"method"=>"get_users_list",
						"users"=>$users,
					));
				}
			break;
			case "assign_rfid":
				//find user by id and set their RFID
				$result = mysql_query("UPDATE users SET rfid = '". $rfid ."' WHERE id=$user_id", $con);
				
				if($result != true){
					output(array(
						"api_status"=>"fail", 
						"method"=>"assign_rfid",
						"message"=>"error assigning RFID",
						"error"=>mysql_errno($con),
						"rfid"=>$rfid
						));
				}
				else{
					output(array(	
						"api_status"=>"success",
						"method"=>"assign_rfid",
						"data"=>$result
					)); 
				}
			break;
			case "log_activity":
				//get current time and enter/exit/rfid and add to db
				if($rfid != NULL && $activity_type != NULL){
					$result = mysql_query("INSERT INTO activity (id, rfid, activity_type, time) VALUES (DEFAULT, '$rfid', '$activity_type', '$time')");
					if($result != true){
						output(array(
							"api_status"=>"fail", 
							"method"=>"log_activity",
							"message"=>"error logging activity"));
					}
					else{
						output(array(	
							"api_status"=>"success",
							"method"=>"log_activity",
							"data"=>"Activity Logged!",
							"rfid"=>$rfid
						)); 
					}
				}
				else{
					output(array(
					"api_status"=>"fail", 
					"method"=>"log_activity",
					"message"=>"please input correct RFID and activity_type",
					"rfid"=>$rfid));
				}
			break;
			case "get_user_activity":
				//get rfid and return array of all activity
				$userResult = mysql_query('SELECT * FROM users WHERE rfid != "0" ORDER BY `id`', $con);
				if($userResult){
					$userActivities = array();
					if($date != NULL){
						$startQuery = date_format(new DateTime($startDate),'%Y.%m.%d %H:%s');
						$endQuery = date_format(new DateTime($endDate),'%Y.%m.%d %H:%s');
					}
					while($user = mysql_fetch_array($userResult, MYSQL_ASSOC)) {
						$activities = array();
						if($date != NULL){
							$query = 'SELECT * FROM activity WHERE rfid = "'. $user['rfid'] . '" AND time BETWEEN \'' . $startDate . '\' AND \'' . $endDate . '\' ORDER BY `id`';
						}
						else{
							$query = 'SELECT * FROM activity WHERE rfid = "'. $user['rfid'] . '" ORDER BY `id`';
							//$query = 'SELECT * FROM activity ORDER BY `id`';
						}
						$activityResult = mysql_query($query, $con);
						if($activityResult){
							while($activity = mysql_fetch_array($activityResult, MYSQL_ASSOC)) {
								$activities[] = array('activity'=>$activity);
							}
						}
						$userActivities[] = array('user'=>$user, 'activities'=>$activities);
					}
				}
				//$result = mysql_query('SELECT * FROM activity WHERE rfid = '. $rfid . ' ORDER BY `id`', $con);
				
				if($userResult != true){
					output(array(
						"api_status"=>"fail",
						"method"=>"get_user_activity",
						"message"=>"error getting user activity."
					));
				}
				else{
					 // RETURN SUCCESS TO THE USER
					output(array(	
						"api_status"=>"success",
						"method"=>"get_user_activity",
						"activities"=>$userActivities,
						"startDate"=>$startDate,
						"endDate"=>$endDate, 
						"query"=>$query
					));
				}
			break;
			
			case 'create_user':
				$result = mysql_query("INSERT INTO users (id, first_name, last_name, rfid) VALUES (DEFAULT, '$first_name', '$last_name', '$rfid')");
				
				if($result != true){
					output(array(
						"api_status"=>"fail", 
						"method"=>"create_user",
						"message"=>"error inserting user"));
				}
				else{
					output(array(	
						"api_status"=>"success",
						"method"=>"create_user",
						"data"=>$result
					)); 
				}
			break;
			default:

				// NO VALID METHOD PROVIDED
				output(array(
					"api_status"=>"fail",
					"method"=>$_REQUEST['method'],
					"message"=>"Invalid method.")); 
			break;
		}
	}else{
		
		output(array(
		"api_status"=>"fail",
		"message"=>"Invalid method.")); 
			
	}
	
	function output($array){
		$json = json_encode($array);
		
		$fn = "db_log.txt";
   		$fp = fopen($fn, "a");
	   fwrite($fp, date("l F d, Y, h:i A") . "," . $json . "\n"); 
	   fclose($fp);
	   
		echo $json;
		exit;	
	}

	
	
?>