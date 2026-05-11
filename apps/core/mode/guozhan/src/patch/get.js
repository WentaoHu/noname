// @ts-nocheck

import { lib, game, ui, get, Get, ai, _status } from "noname";
import { showYexingsContent, chooseCharacterContent, chooseCharacterOLContent } from "./content.js";

export class GetGuozhan extends Get {
	/**
	 * > ?.?
	 *
	 * @param {*} source
	 * @param {*} junling
	 * @param {*} performer
	 * @param {*} targets
	 * @param {*} viewer
	 * @returns
	 */
	junlingEffect(source, junling, performer, targets, viewer) {
		var att1 = get.attitude(viewer, source),
			att2 = get.attitude(viewer, performer);
		var eff1 = 0,
			eff2 = 0;
		switch (junling) {
			case "junling1":
				if (
					!targets.length &&
					game.countPlayer(function (current) {
						return get.damageEffect(viewer, current, viewer) > 0;
					})
				) {
					eff1 = 2;
				} else {
					if (get.damageEffect(targets[0], performer, source) >= 0) {
						eff1 = 2;
					} else {
						eff1 = -2;
					}
					if (get.damageEffect(targets[0], source, performer) >= 0) {
						eff2 = 2;
					} else {
						eff2 = -2;
					}
				}
				break;
			case "junling2":
				if (performer.countCards("he")) {
					eff1 = 1;
					eff2 = 0;
				} else {
					eff1 = 2;
					eff2 = -1;
				}
				break;
			case "junling3":
				if (performer.hp == 1 && !performer.hasSkillTag("save", true)) {
					eff2 = -5;
				} else {
					if (performer == viewer) {
						if (performer.hasSkillTag("maihp", true)) {
							eff2 = 3;
						} else {
							eff2 = -2;
						}
					} else {
						if (performer.hasSkillTag("maihp", false)) {
							eff2 = 3;
						} else {
							eff2 = -2;
						}
					}
				}
				break;
			case "junling4":
				eff1 = 0;
				eff2 = -2;
				break;
			case "junling5":
				var td = performer.isTurnedOver();
				if (td) {
					if (performer == viewer) {
						// @ts-expect-error 祖宗之法就是这么写的
						if (_status.currentPhase == performer && performer.hasSkill("jushou")) {
							eff2 = -3;
						} else {
							eff2 = 3;
						}
					} else {
						eff2 = 3;
					}
				} else {
					if (performer == viewer) {
						if (performer.hasSkillTag("noturn", true)) {
							eff2 = 0;
						} else {
							eff2 = -3;
						}
					} else {
						if (performer.hasSkillTag("noturn", false)) {
							eff2 = 0;
						} else {
							eff2 = -3;
						}
					}
				}
				break;
			case "junling6":
				if (performer.countCards("h") > 1) {
					eff2 += 1 - performer.countCards("h");
				}
				if (performer.countCards("e") > 1) {
					eff2 += 1 - performer.countCards("e");
				}
				break;
		}
		return Math.sign(att1) * eff1 + Math.sign(att2) * eff2;
	}

	/**
	 * > ??.?
	 *
	 * @param {string} name1
	 * @param {string} name2
	 * @returns {boolean}
	 */
	guozhanReverse(name1, name2) {
		if (get.is.double(name2)) {
			return false;
		}
		if (["gz_xunyou", "gz_lvfan", "gz_liubei"].includes(name2)) {
			return true;
		}
		if (name1 == "gz_re_xushu") {
			return true;
		}
		if (name2 == "gz_dengai") {
			return lib.character[name1][2] % 2 == 1;
		}
		if (["gz_sunce", "gz_jiangwei"].includes(name1)) {
			return name2 == "gz_zhoutai" || lib.character[name2][2] % 2 == 1;
		}
		return false;
	}

	/**
	 * 获取武将的等级
	 *
	 * @param {string} name
	 * @param {Player} player
	 * @returns
	 */
	guozhanRank(name, player) {
		if (name.indexOf("gz_shibing") == 0) {
			return -1;
		}
		if (name.indexOf("gz_jun_") == 0) {
			return 7;
		}
		if (player) {
			var skills = lib.character[name][3].slice(0);
			for (var i = 0; i < skills.length; i++) {
				if (lib.skill[skills[i]].limited && player.awakenedSkills.includes(skills[i])) {
					return skills.length - 1;
				}
			}
		}
		if (_status._aozhan) {
			for (var i in lib.aozhanRank) {
				if (lib.aozhanRank[i].includes(name)) {
					return parseInt(i);
				}
			}
		}
		for (var i in lib.guozhanRank) {
			if (lib.guozhanRank[i].includes(name)) {
				return parseInt(i);
			}
		}
		return 0;
	}

	/**
	 * 判断两个国战武将能否组成一组。
	 *
	 * @param {string} name1
	 * @param {string} name2
	 * @returns {boolean}
	 */
	guozhanCanChoosePair(name1, name2) {
		// @ts-expect-error 祖宗之法就是这么写的
		if (_status.separatism) {
			return true;
		}
		const group1 = lib.character[name1][1];
		const group2 = lib.character[name2][1];
		// @ts-expect-error 祖宗之法就是这么写的
		const doublex = get.is.double(name1, true);
		if (doublex) {
			// @ts-expect-error 祖宗之法就是这么写的
			const double = get.is.double(name2, true);
			if (double) {
				return doublex.some(group => double.includes(group));
			}
			return doublex.includes(group2) || lib.selectGroup.includes(group2);
		}
		if (group1 == "ye" || lib.selectGroup.includes(group1)) {
			return group2 != "ye";
		}
		// @ts-expect-error 祖宗之法就是这么写的
		const double = get.is.double(name2, true);
		if (double) {
			return double.includes(group1);
		}
		return group1 == group2 || lib.selectGroup.includes(group2);
	}

	/**
	 * 获取国战武将组合的主副将顺序。
	 *
	 * @param {string} name1
	 * @param {string} name2
	 * @returns {[string, string] | null}
	 */
	guozhanGetOrderedPair(name1, name2) {
		if (!get.guozhanCanChoosePair(name1, name2) && !get.guozhanCanChoosePair(name2, name1)) {
			return null;
		}
		let mainx = name1,
			vicex = name2;
		if (!get.guozhanCanChoosePair(mainx, vicex) || (get.guozhanCanChoosePair(vicex, mainx) && get.guozhanReverse(mainx, vicex))) {
			mainx = name2;
			vicex = name1;
		}
		return [mainx, vicex];
	}

	/**
	 * 计算国战武将组合的选将分。
	 *
	 * @param {string} mainx
	 * @param {string} vicex
	 * @param {Player} [player]
	 * @returns {number}
	 */
	guozhanChoiceScore(mainx, vicex, player) {
		const mainRank = get.guozhanRank(mainx, player);
		const viceRank = get.guozhanRank(vicex, player);
		let score = mainRank * 1.1 + viceRank + get.guozhanPairSynergy(mainx, vicex);
		const mainDouble = get.is.double(mainx, true);
		const viceDouble = get.is.double(vicex, true);
		const mainGroup = lib.character[mainx][1];
		const viceGroup = lib.character[vicex][1];
		if (mainDouble && viceDouble && mainDouble.some(group => viceDouble.includes(group))) {
			score += 0.4;
		} else if (mainDouble && mainDouble.includes(viceGroup)) {
			score += 0.3;
		} else if (viceDouble && viceDouble.includes(mainGroup)) {
			score += 0.3;
		} else if (mainGroup == viceGroup && mainGroup != "ye" && !lib.selectGroup.includes(mainGroup)) {
			score += 0.2;
		}
		return score;
	}

	/**
	 * 获取国战武将组合的技能联动加分。
	 *
	 * @param {string} name1
	 * @param {string} name2
	 * @returns {number}
	 */
	guozhanPairSynergy(name1, name2) {
		const pair = [name1, name2].sort().join("|");
		const synergy = {
			// 鬼才黑牌改判配合洛神获得黑色判定牌，能把改判成本转化为过牌收益。
			["gz_simayi|gz_zhenji"]: 5,
			// 天妒可回收洛神停止时的红色判定牌，降低洛神判定损耗。
			["gz_guojia|gz_zhenji"]: 4,
			// 咆哮需要稳定杀来源，武圣能把红牌大量转化为杀。
			["gz_guanyu|gz_zhangfei"]: 7,
			// 龙胆把闪转为杀，补足咆哮的杀来源。
			["gz_zhangfei|gz_zhaoyun"]: 5,
			// 纳蛮回收打出的杀，咆哮能把杀资源转化为爆发。
			["gz_maliang|gz_zhangfei"]: 4,
			// 枭姬和旋略都吃失去装备，勇进能主动制造装备流转。
			["gz_lingtong|gz_sunshangxiang"]: 5,
			// 调度推动装备使用和转移，枭姬吃装备离区收益。
			["gz_lvfan|gz_sunshangxiang"]: 5,
			// 甘露交换装备可以主动触发枭姬过牌。
			["gz_sunshangxiang|gz_wuguotai"]: 4,
			// 甘露制造装备离区，旋略转化为拆牌控制。
			["gz_lingtong|gz_wuguotai"]: 3,
			// 双卖血收益，受伤后兼具拿伤害牌和遗计分牌。
			["gz_caocao|gz_guojia"]: 4,
			// 奸雄配节命，受伤后既能回收资源又能补手牌上限。
			["gz_caocao|gz_xunyu"]: 4,
			// 放逐和遗计都吃受伤触发，兼具过牌和翻面节奏。
			["gz_caopi|gz_guojia"]: 4,
			// 放逐配节命，受伤后能补手牌并控制敌方节奏。
			["gz_caopi|gz_xunyu"]: 4,
			// 鬼才可辅助屯田判定，提升攒田稳定性。
			["gz_dengai|gz_simayi"]: 3,
			// 鬼才可控制刚烈判定，按局面选择伤害或弃牌。
			["gz_simayi|gz_xiahoudun"]: 3,
			// 观星提升锦囊牌质量，集智把普通锦囊转为过牌。
			["gz_huangyueying|gz_zhugeliang"]: 3,
			// 屯江/兴祚类过牌配合晋势力的高资源转化。
			["gz_jin_simayi|gz_jin_zhangchunhua"]: 3,
			// 族父母子组合，递牌和爆发窗口更稳定。
			["gz_jin_simazhao|gz_jin_wangyuanji"]: 3,
			// 灭吴线，承流和转战都依赖持续输出与装备/牌差滚动。
			["gz_malong|gz_wangjun"]: 3,
			// 灵梦要求珠联璧合，给小额可见组合收益。
			["gz_bailingyun|gz_wenyang"]: 2,
			// 应势借队友出牌，顺服提供额外爆发入口。
			["gz_new_jin_simayi|gz_simaliang"]: 3,
			// 伤势过牌配合防御/回复类晋将，低血线更容易屯资源。
			["gz_new_jin_zhangchunhua|gz_wangxiang"]: 2,
			// 图射高过牌配合立牧自保，是野心家里最强的单人爆发线。
			["gz_jsrg_liuyan|gz_yl_yuanshu"]: 3,
			// 无常收益与利驭输出互相抬高，兼具过牌和杀伤。
			["gz_pot_weiyan|gz_sb_lvbu"]: 2,
		};
		return synergy[pair] || 0;
	}

	/**
	 * 获取本局禁用势力。
	 *
	 * @returns {string | null}
	 */
	guozhanBannedGroup() {
		const group = _status.bannedGroup?.slice(6);
		return ["wei", "shu", "wu", "qun", "jin"].includes(group) ? group : null;
	}

	/**
	 * 判断国战可用将池中是否存在晋势力武将。
	 *
	 * @returns {boolean}
	 */
	guozhanHasJinPool() {
		const banned = _status.connectMode ? lib.configOL.banned || [] : lib.config.guozhan_banned || [];
		for (const name in lib.characterPack.mode_guozhan) {
			const info = lib.characterPack.mode_guozhan[name];
			if (!info || name.indexOf("gz_shibing") == 0 || get.is.jun(name) || banned.includes(name) || lib.filter.characterDisabled(name)) {
				continue;
			}
			if (info.group == "jin" || info.doubleGroup?.includes("jin")) {
				return true;
			}
		}
		return false;
	}

	/**
	 * 获取本局随机保留的野心家。
	 *
	 * @returns {string[]}
	 */
	guozhanYexinjiaPool() {
		if (_status.guozhanYexinjiaPool) {
			return _status.guozhanYexinjiaPool;
		}
		const sort = lib.characterSort?.mode_guozhan?.guozhan_yexinjia;
		if (!sort?.length) {
			_status.guozhanYexinjiaPool = [];
			return _status.guozhanYexinjiaPool;
		}
		const banned = _status.connectMode ? lib.configOL.banned || [] : lib.config.guozhan_banned || [];
		_status.guozhanYexinjiaPool = sort
			.filter(name => lib.character[name] && !banned.includes(name) && !lib.filter.characterDisabled(name))
			.randomGets(2);
		return _status.guozhanYexinjiaPool;
	}

	/**
	 * 判断武将是否被本局禁势力或野心家限量规则排除。
	 *
	 * @param {string} name
	 * @returns {boolean}
	 */
	guozhanIsBannedChoice(name) {
		const info = lib.character[name];
		if (!info) {
			return true;
		}
		const banned = _status.connectMode ? lib.configOL.banned || [] : lib.config.guozhan_banned || [];
		if (banned.includes(name)) {
			return true;
		}
		if (info.group == "ye" && !get.guozhanYexinjiaPool().includes(name)) {
			return true;
		}
		const bannedGroup = get.guozhanBannedGroup();
		if (!bannedGroup) {
			return false;
		}
		const double = get.is.double(name, true);
		if (double) {
			return double.every(group => group == bannedGroup);
		}
		return info.group == bannedGroup;
	}

	/**
	 * 准备本局选将池。
	 *
	 * @param {string[]} list
	 * @returns {string[]}
	 */
	guozhanPrepareChoicePool(list) {
		return list.filter(name => !get.guozhanIsBannedChoice(name));
	}

	/**
	 * 获取选将界面的本局规则提示。
	 *
	 * @returns {string[]}
	 */
	guozhanChoiceHint() {
		const hints = [];
		const bannedGroup = get.guozhanBannedGroup();
		if (bannedGroup) {
			hints.push(`本局禁用势力：${get.translation(bannedGroup)}`);
		}
		const yexinjiaPool = get.guozhanYexinjiaPool();
		if (yexinjiaPool.length) {
			hints.push(`可用野心家${yexinjiaPool.length}人：${yexinjiaPool.map(name => get.translation(name)).join("，")}`);
		}
		return hints;
	}

	/**
	 * 获取某名角色在公开信息下可见的武将等级。
	 *
	 * @param {Player} player
	 * @returns {number}
	 */
	guozhanVisibleRank(player) {
		if (!player) {
			return 0;
		}
		let rank = 0,
			name1,
			name2;
		if (!player.isUnseen(0)) {
			name1 = player.name1;
			rank += get.guozhanRank(name1, player);
		}
		if (!player.isUnseen(1)) {
			name2 = player.name2;
			rank += get.guozhanRank(name2, player);
		}
		if (name1 && name2) {
			rank += get.guozhanPairSynergy(name1, name2);
		}
		return rank;
	}

	/**
	 * 在不透视暗将的前提下获取公开/推测势力。
	 *
	 * @param {Player} from
	 * @param {Player} target
	 * @returns {string}
	 */
	guozhanPublicGroup(from, target) {
		if (!target) {
			return "unknown";
		}
		if (from == target) {
			return target.identity != "unknown" ? target.identity : target.getGuozhanGroup(2);
		}
		if (!target.isUnseen()) {
			return target.identity;
		}
		const hint = target.ai?.guozhanGroupHint;
		if (hint) {
			let best = "unknown",
				bestScore = 0;
			for (const group of ["wei", "shu", "wu", "qun", "jin", "ye"]) {
				const score = hint[group] || 0;
				if (score > bestScore) {
					best = group;
					bestScore = score;
				}
			}
			if (bestScore >= 2) {
				return best;
			}
		}
		return "unknown";
	}

	/**
	 * 获取公开阵营威胁，野心家按三人阵营处理。
	 *
	 * @param {Player} from
	 * @param {string} group
	 * @returns {number}
	 */
	guozhanCampThreat(from, group) {
		if (!group || group == "unknown") {
			return 0;
		}
		let members = 0,
			cards = 0;
		game.countPlayer(current => {
			if (get.guozhanPublicGroup(from, current) != group) {
				return false;
			}
			members += group == "ye" ? 3 : 1;
			cards += current.countCards("he");
			return false;
		});
		return members + cards;
	}

	/**
	 * 获取公开信息下的单体威胁。
	 *
	 * @param {Player} from
	 * @param {Player} target
	 * @returns {number}
	 */
	guozhanThreat(from, target) {
		if (!target || target == from) {
			return 0;
		}
		const group = get.guozhanPublicGroup(from, target);
		let threat = target.countCards("h") + get.guozhanCampThreat(from, group) + get.guozhanVisibleRank(target);
		if (group == "ye") {
			threat += 2;
		}
		if (target.isUnseen()) {
			threat = target.countCards("h") + Math.max(0, (target.ai?.shown || 0) * 2);
			const hint = target.ai?.guozhanGroupHint?.[group] || 0;
			if (group != "unknown" && hint >= 2) {
				threat += get.guozhanCampThreat(from, group) * 0.5;
			}
		}
		return threat;
	}

	/**
	 * 获取集火优先级。
	 *
	 * @param {Player} from
	 * @param {Player} target
	 * @returns {number}
	 */
	guozhanFocusScore(from, target) {
		if (!target || target == from) {
			return 0;
		}
		let score = get.guozhanThreat(from, target);
		if (from.canUse && from.canUse("sha", target, false)) {
			score += 2;
		}
		game.countPlayer(current => {
			if (current == from || current == target || get.guozhanPublicGroup(from, current) != get.guozhanPublicGroup(from, from)) {
				return false;
			}
			if (current.canUse && current.canUse("sha", target, false)) {
				score += 1;
			}
			return false;
		});
		score += Math.max(0, 5 - target.countCards("h")) * 0.2;
		return score;
	}

	/**
	 * 从候选列表中选择评分最高的国战武将组合。
	 *
	 * @param {string[]} list
	 * @param {Player} [player]
	 * @returns {[string, string] | null}
	 */
	guozhanBestChoice(list, player) {
		let best = null,
			bestScore = -Infinity;
		for (let i = 0; i < list.length - 1; i++) {
			for (let j = i + 1; j < list.length; j++) {
				const pair = get.guozhanGetOrderedPair(list[i], list[j]);
				if (!pair) {
					continue;
				}
				const score = get.guozhanChoiceScore(pair[0], pair[1], player);
				if (score > bestScore) {
					best = pair;
					bestScore = score;
				}
			}
		}
		return best;
	}

	/**
	 * > ?.??
	 *
	 * @param {Player} from
	 * @param {Player} to
	 * @param {number} difficulty
	 * @param {string} toidentity
	 * @returns
	 */
	realAttitude(from, to, difficulty, toidentity) {
		var getIdentity = function (player) {
			return get.guozhanPublicGroup(from, player);
		};
		var fid = getIdentity(from);
		if (toidentity == "unknown") {
			return 0;
		}
		if (fid == toidentity && toidentity != "ye") {
			return 4 + difficulty;
		}
		if (from.identity == "unknown" && fid == toidentity) {
			if (from.wontYe()) {
				return 4 + difficulty;
			}
		}
		var groups = [];
		var map = {},
			sides = [],
			pmap = _status.connectMode ? lib.playerOL : game.playerMap,
			player;
		for (var i of game.players) {
			const identity = getIdentity(i);
			if (identity == "unknown") {
				continue;
			}
			var added = false;
			for (var j of sides) {
				if ((identity == getIdentity(pmap[j]) && identity != "ye") || (!i.isUnseen() && !pmap[j].isUnseen() && i.isFriendOf(pmap[j]))) {
					added = true;
					map[j].push(i);
					if (i == this) {
						player = j;
					}
					break;
				}
			}
			if (!added) {
				map[i.playerid] = [i];
				sides.push(i.playerid);
				if (i == this) {
					player = i.playerid;
				}
			}
		}
		for (var i in map) {
			var num = map[i].length;
			groups.push(num);
		}
		var max = Math.max.apply(this, groups);
		if (max <= 1) {
			return -3;
		}
		var from_p;
		if (fid == "unknown") {
			from_p = 0;
		} else if (fid == "ye") {
			from_p = 3;
		} else {
			from_p = game.countPlayer(function (current) {
				return getIdentity(current) == fid;
			}, true);
		}
		var to_p = game.countPlayer(function (current) {
			return getIdentity(current) == toidentity;
		}, true);
		if (toidentity == "ye") {
			to_p += 2;
		}

		if (to_p >= max) {
			return -5;
		}
		if (from_p >= max) {
			return -2 - to_p;
		}
		if (max >= game.players.length / 2) {
			if (to_p <= from_p) {
				return 0.5;
			}
			return 0;
		}
		if (to_p < max - 1) {
			return 0;
		}
		return -0.5;
	}

	/**
	 * > ??.??
	 *
	 * @param {Player} from
	 * @param {Player} to
	 * @returns
	 */
	rawAttitude(from, to) {
		var getIdentity = function (player) {
			return get.guozhanPublicGroup(from, player);
		};
		var fid = getIdentity(from),
			tid = getIdentity(to);
		if (to.identity == "unknown" && game.players.length == 2) {
			return -5;
		}
		if (_status.currentPhase == from && from.ai.tempIgnore && from.ai.tempIgnore.includes(to) && to.identity == "unknown" && (!from.storage.zhibi || !from.storage.zhibi.includes(to))) {
			return 0;
		}
		var difficulty = 0;
		if (to == game.me) {
			difficulty = (2 - get.difficulty()) * 1.5;
		}
		if (from == to) {
			return 5 + difficulty;
		}
		if (!to.isUnseen() && from.isFriendOf(to)) {
			return 5 + difficulty;
		}
		if (fid != "unknown" && fid == tid && fid != "ye") {
			return 5 + difficulty;
		}
		var att = get.realAttitude(from, to, difficulty, tid);
		if (att < 0) {
			att -= Math.min(3, get.guozhanFocusScore(from, to) / 10);
		}
		if (from.storage.zhibi && from.storage.zhibi.includes(to)) {
			return att;
		}
		if (tid == "unknown") {
			return Math.min(0, Math.random() - 0.6) + difficulty;
		}
		if (to.ai.shown >= 0.5) {
			return att * to.ai.shown;
		}

		var nshown = 0;
		for (var i = 0; i < game.players.length; i++) {
			if (game.players[i] != from && game.players[i].identity == "unknown") {
				nshown++;
			}
		}
		if (to.ai.shown == 0) {
			if (nshown >= game.players.length / 2 && att >= 0) {
				return 0;
			}
			return Math.min(0, Math.random() - 0.5) + difficulty;
		}
		if (to.ai.shown >= 0.2) {
			if (att > 2) {
				return Math.max(0, Math.random() - 0.5) + difficulty;
			}
			if (att >= 0) {
				return 0;
			}
			return Math.min(0, Math.random() - 0.7) + difficulty;
		}
		if (att > 2) {
			return Math.max(0, Math.random() - 0.7) + difficulty;
		}
		if (att >= 0) {
			return Math.min(0, Math.random() - 0.3) + difficulty;
		}
		return Math.min(0, Math.random() - 0.5) + difficulty;
	}
}
