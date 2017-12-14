# Description:
#   Example scripts for you to examine and try out.
#
# Notes:
#   They are commented out by default, because most of them are pretty silly and
#   wouldn't be useful and amusing enough for day to day huboting.
#   Uncomment the ones you want to try and experiment with.
#
#   These are from the scripting documentation: https://github.com/github/hubot/blob/master/docs/scripting.md
module.exports = (robot) ->	
	robot.hear /#(\d+)/i, (res) ->
		issueId = res.match[1]
		updatedMsg = res.message.text.replace("##{issueId}", "[##{issueId}](https://rb-tracker.bosch.com/tracker01/browse/TTCPI-#{issueId})")
		res.message.text = updatedMsg
		
		# Call edit.  (bot will have to have the permission to do this)
		params = {
			_id: res.message.id
			rid: res.message.room
			msg: res.message.text
		}
		robot.adapter.callMethod('updateMessage', params)