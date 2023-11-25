import * as crypto from "crypto";

const MAX_ASSIGNMENT_ATTEMPTS = 10;
const MAX_TOTAL_RESTARTS = 10000;

type GiftAssignment = {[key: string]: string | null}
type SignificantOthers = [string, string];
type GiftAssignmentRule = (giver: string, receiver: string, assignments: GiftAssignment) => boolean;

const defaultRules: GiftAssignmentRule[] = [
    (giver: string, receiver: string, assignments: GiftAssignment) => {
        return assignments[giver] !== giver;
    }
];

function rulesFactory(significantOthers: SignificantOthers[], additionalRules: GiftAssignmentRule[]): GiftAssignmentRule[] {
    const allRules: GiftAssignmentRule[] = [...defaultRules, ...additionalRules];
    significantOthers.forEach((couple: SignificantOthers) => allRules.push((giver: string, receiver: string) => {
        const first = couple[0];
        const second = couple[1];

        if (giver === first) {
            return receiver !== second;
        }
        if (giver === second) {
            return receiver !== first;
        }
        return true;
    }));
    return allRules;
}

function main(givers: string[], significantOthers: SignificantOthers[], additionalRules: GiftAssignmentRule[]): GiftAssignment {
    const allRules = rulesFactory(significantOthers, additionalRules);
    let assignments: GiftAssignment = {};

    let previousGiverAttempt = 0;
    let totalRestarts = 0;
    while (Object.values(assignments).length !== givers.length) {
        const unassignedGivers: string[] = givers.filter((giver) => !assignments[giver]);
        const nextGiver: string = unassignedGivers[crypto.randomInt(unassignedGivers.length)];
        const unassignedReceivers: string[] = givers.filter(giver => !Object.values(assignments).includes(giver));
        const nextReceiver: string = unassignedReceivers[crypto.randomInt(unassignedReceivers.length)];
        assignments[nextGiver] = nextReceiver;
        if (!allRules.every((rule: GiftAssignmentRule) => rule(nextGiver, nextReceiver, assignments))) {
            delete assignments[nextGiver];
            previousGiverAttempt++;
        }
        if (previousGiverAttempt > MAX_ASSIGNMENT_ATTEMPTS) {
            assignments = {};
            totalRestarts++;
            previousGiverAttempt = 0;
            console.log(`Attempt ${totalRestarts} failed`);
        }
        if (totalRestarts >= MAX_TOTAL_RESTARTS) {
            throw Error('Max total restarts reached. Unable to create assignments.')
        }
    }

    return assignments;
}

const KAYLA = 'kayla';
const MITCH = 'mitch';
const TYLER = 'tyler';
const ZACH = 'zach';
const ALYSSUM = 'alyssum';
const EMMA = 'emma';
const SOPHIE = 'sophie';

const ALL_GIVERS = [KAYLA, MITCH, TYLER, ZACH, ALYSSUM, EMMA, SOPHIE];

const additionalRules = [
    (giver: string, receiver: string, assignments: GiftAssignment) => {
        if ((giver === KAYLA || giver === MITCH) && assignments[KAYLA] && assignments[MITCH]) {
            return assignments[KAYLA] === TYLER || assignments[MITCH] === TYLER;
        }
        return true;
    },
    (giver: string, receiver: string, assignments: GiftAssignment) => {
        if (giver === TYLER) {
            return assignments[TYLER] === SOPHIE || assignments[TYLER] === EMMA;
        }
        return true;
    },
];

const significantOthers: SignificantOthers[] = [[ZACH, ALYSSUM], [KAYLA, MITCH]];

console.log(main(ALL_GIVERS, significantOthers, additionalRules));
