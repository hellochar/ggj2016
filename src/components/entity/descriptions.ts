import { EntityType } from "model/";

export default function descriptionForEntity(type: EntityType) {
    switch (type) {
        case "user": return "An aspiring adventurer.";
        case "mercury": return "A cave-dweller, not so different from you and I.";
        case "ring": return "The fabled Ring of Norsgoloth. Who knows what would happen when it's worn?";
        case "tree":
            return "Sorrow is knowledge, those that know the most must mourn the deepest, the tree of knowledge is not the tree of life.";
        case "fruit": return "The roots of education are bitter, but the fruit is sweet.";
        case "house": return "Have nothing in your house that you do not know to be useful, or believe to be beautiful.";
        case "axe": return "Your trusty axe! Cuts down trees in one turn and does 3 damage to foes.";
    }
}
