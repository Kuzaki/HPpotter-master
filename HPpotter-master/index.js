module.exports = function HPpotter (dispatch) {

	let cid = null,
		player = '',
		cooldown = false,
		enabled,
		battleground,
		onmount,
		incontract,
		inbattleground,
		alive,
		inCombat

	// ********************
	// ***FUNCION SCRIPT***
	// ********************

	dispatch.hook('S_LOGIN', 1, event => {
		({cid} = event)
		player = event.name
		enabled = true
	})

	dispatch.hook('S_START_COOLTIME_ITEM', 1, event => {
		let item = event.item
		let thiscooldown = event.cooldown

		if(item == 6552) { //tiene 10 segundos de cooldown
			cooldown = true
			setTimeout(() => {
				cooldown = false
			}, thiscooldown*1000)
		}	
	})

	dispatch.hook('S_PLAYER_STAT_UPDATE', 1, event => {
		curHp = event.curHp
		maxHp = event.maxHp

		if(!cooldown && (curHp <= maxHp/3)){
			usarPocion()
		}
	})

	function usarPocion(){
		if (!enabled) return
		if(alive && inCombat && !onmount && !incontract && !inbattleground) {
			dispatch.toServer('C_USE_ITEM', 1,{
				ownerId: cid,
				item: 6552, // 6552 = Prime Recovery Potable
				id: 0,
				unk1: 0,
				unk2: 0,
				unk3: 0,
				unk4: 1,
				unk5: 0,
				unk6: 0,
				unk7: 0,
				x: 0, 
				y: 0, 
				z: 0, 
				w: 0, 
				unk8: 0,
				unk9: 0,
				unk10: 0,
				unk11: 1,
			})
		}
	}

	// ##############
	// ### Checks ###
	// ##############

	dispatch.hook('S_BATTLE_FIELD_ENTRANCE_INFO', 1, event => { battleground = event.zone })
	dispatch.hook('S_LOAD_TOPO', 1, event => {
		onmount = false
		incontract = false
		inbattleground = event.zone == battleground
	})

	dispatch.hook('S_SPAWN_ME', 1, event => {
		alive = event.alive
	})

	dispatch.hook('S_USER_STATUS', 1, event => {
		if(event.target.equals(cid)){
			if(event.status == 1){
				inCombat = true
			}
			else inCombat = false
		}
	})

	dispatch.hook('S_CREATURE_LIFE', 1, event => {
		if(event.target.equals(cid) && (alive != event.alive)) {
			if(!alive) {
				onmount = false
				incontract = false
			}
		}
	})
	
	dispatch.hook('S_MOUNT_VEHICLE', 1, event => { if(event.target.equals(cid)) onmount = true })
	dispatch.hook('S_UNMOUNT_VEHICLE', 1, event => { if(event.target.equals(cid)) onmount = false })

	dispatch.hook('S_REQUEST_CONTRACT', 1, event => { incontract = true })
	dispatch.hook('S_ACCEPT_CONTRACT', 1, event => { incontract = false })
	dispatch.hook('S_REJECT_CONTRACT', 1, event => { incontract = false })
	dispatch.hook('S_CANCEL_CONTRACT', 1, event => { incontract = false })

	// #################
	// ### CHAT HOOK ###
	// #################

	 dispatch.hook('C_WHISPER', 1, (event) => {
	 	if (event.target.toUpperCase() === "!hppotter".toUpperCase()){
	 		if (/^<FONT>on?<\/FONT>$/i.test(event.message)) {
	 			enabled = true
	 			message('HPpotter <font color="#56B4E9">activado</font>.')
	 		}
	 		else if (/^<FONT>off?<\/FONT>$/i.test(event.message)) {
	 			enabled = false
	 			message('HPpotter <font color="#E69F00">desactivado</font>.')
	 		}
	 		else message('Commands:<br>'
				                        + ' "on" (activar HPpotter),<br>'
							            + ' "off" (desactivar HPpotter)'
			 			)
 			return false
	 	}
	 })

	 function message(msg){
	 	dispatch.toClient('S_WHISPER', 1, {
	 		player: cid,
	 		unk1: 0,
	 		gm: 0,
	 		unk2: 0,
			author: '!Stu',
			recipient: player,
			message: msg
	 	})
	 }

	 dispatch.hook('C_CHAT', 1, event =>{
	 	if(/^<FONT>!hpots<\/FONT>$/i.test(event.message)){
	 		if(!enabled){
	 			enabled = true
	 			message('HPpotter <font color="#56B4E9">activado</font>.')
				console.log('HPpotter activado.')
	 		}
	 		else {
	 			enabled = false
	 			message('HPpotter <font color="#56B4E9">desactivado</font>.')
				console.log('HPpotter desactivado.')
	 		}
	 		return false
	 	}
	 })
}
