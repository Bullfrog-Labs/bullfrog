import Logging from "../src/services/Logging";
import FirestoreDatabase from "../src/services/FirestoreDatabase";
import FirebaseAdmin from "../src/services/FirebaseAdmin";
import * as log from "loglevel";
import { NoteRecord, UserRecord } from "../src/services/Database";

Logging.configure(log);

const notes: NoteRecord[] = [
  {
    body:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur sed mollis dui. Phasellus accumsan tempor venenatis. Aenean varius ornare velit, nec ullamcorper erat aliquam ac. Curabitur ullamcorper urna erat, id hendrerit lacus lacinia sit amet. Aenean mollis, elit fermentum sodales dignissim, diam purus rhoncus elit, quis lacinia lacus dolor accumsan leo. Integer nibh ante, feugiat ut porttitor vel, tristique a quam. Ut vitae molestie eros. Duis pharetra lectus ut risus congue condimentum sed eu est. Morbi rutrum ligula vitae placerat ultrices.",
  },
  {
    body:
      "Nulla tristique tortor tellus, vitae volutpat nulla vehicula eu. Praesent sit amet ex bibendum, pretium neque vitae, placerat velit. Fusce facilisis mollis rhoncus. Vivamus interdum commodo ultrices. Aliquam finibus enim sed nisl pulvinar convallis. Etiam a venenatis erat. Praesent pellentesque magna mi, et malesuada ipsum feugiat nec.",
  },
  {
    body:
      "Etiam luctus, nisl id commodo pretium, massa felis blandit orci, fringilla interdum leo felis ut sem. Morbi in lectus felis. Suspendisse potenti. Nunc vel facilisis quam. Quisque non ullamcorper erat. Aenean pharetra gravida eros, quis tristique ipsum tempus imperdiet. In in arcu dolor. Vivamus imperdiet est eu auctor tincidunt. Fusce elementum leo et sem scelerisque, vel sodales risus dapibus. Etiam interdum varius malesuada. Pellentesque sed sodales sapien. Vivamus aliquet leo ac malesuada bibendum. Duis lobortis neque elementum, lobortis lectus at, consequat orci. Fusce eget neque vulputate, facilisis nibh nec, lacinia orci.",
  },
  {
    body:
      "Pellentesque commodo metus vitae urna pellentesque dignissim. Integer et felis egestas arcu rutrum accumsan. Nulla dapibus magna mauris, in consequat turpis consectetur sagittis. Aliquam scelerisque urna sapien, nec consectetur metus consectetur id. Nulla eget elit neque. Nulla facilisi. Sed quis rutrum dolor, eget molestie massa. Vivamus maximus quam eget diam aliquam euismod. Nullam facilisis porta leo, sed imperdiet massa egestas eget. Nam id nulla in lectus pulvinar iaculis quis nec felis. Praesent sit amet sapien non nibh porttitor molestie. Duis felis orci, blandit blandit dapibus vel, mollis a nibh. Fusce at ipsum diam. Cras congue, dolor sit amet cursus mollis, sem mauris aliquam tortor, quis feugiat massa ante id sem. Suspendisse pharetra hendrerit neque, vitae facilisis leo lobortis nec.",
  },
  {
    body:
      "Integer in quam nec neque accumsan venenatis vitae ut odio. Mauris quis erat et odio semper blandit eu id nisi. Nunc auctor porta eros fringilla mollis. Nulla tempor ut metus et commodo. Morbi nec dui pharetra, elementum sem at, aliquet ligula. Fusce ut elit aliquet, molestie nunc faucibus, ornare quam. Fusce et leo non arcu finibus bibendum quis quis turpis. Quisque rutrum lacinia leo. Phasellus bibendum elit sed quam mattis, ut aliquam est commodo. Proin aliquet risus eu sapien malesuada, sit amet imperdiet ante viverra. Donec dictum non nisi et volutpat. In orci mi, ultrices non maximus mattis, vehicula at nisi. Nullam porttitor ultrices luctus. Vestibulum vel vulputate dui, non porttitor mauris. Donec vestibulum vestibulum vulputate. Nam sed ante nec tortor auctor tristique vel sit amet orci.",
  },
  {
    body:
      "Nunc finibus ullamcorper diam eu congue. Donec sed venenatis nulla, vitae placerat quam. Nam et vulputate nisl, in volutpat sapien. Etiam eget pellentesque quam, eu viverra ex. Vestibulum mollis ipsum sit amet eros ornare consectetur. Quisque nec fringilla nisi. Nulla mauris nulla, placerat ut eleifend non, consectetur eu libero. Proin semper ex at nisi commodo placerat. Mauris vel ligula metus. Pellentesque nulla tortor, sodales vitae eleifend eget, maximus et erat. Sed pellentesque justo sit amet accumsan sodales. Aliquam faucibus vehicula nulla, at molestie orci sollicitudin eget. In eu est gravida, lobortis dui at, maximus dui. Nullam et purus id enim lobortis commodo. Vivamus mollis porta nulla a sollicitudin.",
  },
  {
    body:
      "Duis tempus neque sit amet vulputate ultricies. Nulla suscipit tempor lorem, vel ornare enim mattis ut. Suspendisse at massa ultricies leo luctus bibendum. Nulla eget arcu placerat, vestibulum ante a, porta magna. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Integer porta neque eget ligula congue semper et non orci. Vestibulum orci elit, placerat in molestie sit amet, consequat quis nisi. Nulla lobortis porta neque non congue. Maecenas vitae velit et felis elementum venenatis non malesuada lacus. Integer accumsan ultrices diam, vel sagittis lacus interdum nec. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam varius sem id mi vulputate dapibus. Maecenas iaculis accumsan imperdiet. Fusce diam nibh, placerat et eleifend sed, laoreet et risus. Morbi mollis, ante id consequat faucibus, sapien ipsum eleifend lorem, nec feugiat nisi turpis vitae sapien.",
  },
  {
    body:
      "Vestibulum gravida magna vel est venenatis, vitae iaculis urna ullamcorper. Phasellus in imperdiet est, et ornare erat. Curabitur tempor leo justo, sed molestie sapien ornare eget. Morbi finibus bibendum ante ac tristique. Ut vel mauris magna. Donec pretium sollicitudin velit id pretium. Cras vestibulum ut dolor id elementum. In eu consequat risus. Morbi ornare ligula purus, blandit scelerisque augue euismod quis. In quis elit et felis pulvinar tincidunt in in enim. Mauris et scelerisque purus. Praesent viverra in lorem ultricies posuere. Pellentesque diam dui, porttitor a odio sed, auctor tincidunt justo. Sed posuere leo at nulla elementum tempor. Praesent convallis rutrum lectus.",
  },
  {
    body:
      "Sed posuere ligula pellentesque urna aliquam, vel fringilla velit aliquam. Curabitur tempor sit amet lorem vitae ultricies. Pellentesque nibh eros, interdum ac elementum non, lacinia at libero. Curabitur efficitur feugiat imperdiet. Vestibulum quis purus lectus. Pellentesque elementum justo ut facilisis dictum. Donec vestibulum dui a quam auctor, a mollis nibh mattis. Etiam venenatis eu sem eu iaculis. Ut cursus viverra scelerisque. Nulla id risus eu lacus pharetra tincidunt eu a turpis. Sed hendrerit leo ac placerat maximus.",
  },
  {
    body:
      "Praesent dapibus, velit ut semper vulputate, est risus finibus erat, id viverra velit nunc et tellus. Phasellus placerat vel diam vel ullamcorper. Donec egestas lorem id sapien tristique, ac gravida nisl fringilla. Nulla aliquet euismod purus, ac porttitor magna. Ut scelerisque neque ante, quis egestas lectus laoreet sit amet. Sed lacinia lacus id nulla sodales, ac tincidunt mi aliquam. Proin ut scelerisque felis. Suspendisse sit amet gravida nibh, sit amet porta erat.",
  },
  {
    body:
      "Integer efficitur egestas tortor, vel dignissim lorem sodales eget. Praesent eget posuere diam. Cras tristique vestibulum lectus, in mollis turpis semper at. Morbi egestas nulla ipsum, mattis gravida arcu ultrices ullamcorper. Cras vel ornare velit. Nulla tincidunt sodales viverra. Nullam iaculis vulputate maximus. Vivamus varius cursus leo. Fusce finibus augue quis felis scelerisque lobortis. Quisque sodales metus interdum sem rhoncus tincidunt. Fusce imperdiet accumsan aliquam. Nunc elementum orci sit amet risus laoreet interdum in consequat urna. Morbi id laoreet tortor.",
  },
  {
    body:
      "Sed iaculis ultricies metus, quis convallis urna viverra non. Aenean a turpis non nibh ultrices porttitor eu vel dui. Curabitur nec ipsum ut leo viverra aliquet quis sit amet nisi. Phasellus pharetra pellentesque volutpat. Aenean at nunc dolor. Phasellus at suscipit mi. Nulla cursus aliquam pharetra. Pellentesque vestibulum, arcu at placerat ornare, orci sem lobortis odio, sit amet posuere risus arcu sed libero. Nullam id ex eu erat finibus tristique.",
  },
  {
    body:
      "Curabitur ut sem eu nulla hendrerit ullamcorper efficitur ut eros. Vivamus vitae commodo sapien, eget consectetur turpis. Maecenas tempor sem non nisl ultrices, sed dictum elit pulvinar. Maecenas metus lectus, efficitur vel porta sit amet, imperdiet id risus. Sed et ipsum augue. Ut id dolor pharetra, iaculis nulla vitae, tempor purus. Etiam ultricies gravida libero in condimentum. Aenean feugiat ac sem consectetur hendrerit. Sed faucibus sem est, eget vulputate erat bibendum et. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Mauris ac ipsum quis enim egestas porttitor ut vel risus. In et varius nisi. Vestibulum facilisis felis porta, tincidunt neque eget, feugiat est. Sed ac facilisis mi, fringilla pellentesque nulla. Aliquam molestie suscipit lorem, in luctus libero accumsan eu. Curabitur tortor urna, varius non urna euismod, suscipit scelerisque ex.",
  },
  {
    body:
      "Cras id massa id odio cursus suscipit. Pellentesque suscipit lorem nec pharetra iaculis. Aliquam malesuada, erat eget ultrices cursus, diam ex efficitur arcu, quis scelerisque nulla augue vel dolor. Phasellus laoreet fermentum ante eget faucibus. Donec pellentesque nunc non sem rutrum cursus. Etiam lacus nulla, porta ut arcu non, mollis aliquam ex. Nullam eget lacus eu ex molestie hendrerit. Proin fermentum sollicitudin aliquam. Nullam pulvinar velit at sem eleifend suscipit. Suspendisse ut est eget libero fermentum rutrum. Aenean efficitur dui id semper mollis. Donec a libero tellus. Nullam vel mollis enim, a consequat justo. Sed vehicula leo ac metus efficitur, eu rhoncus magna molestie. Duis et mauris cursus, porta orci nec, posuere arcu. Nam porttitor nisl a porta imperdiet.",
  },
  {
    body:
      "Aenean odio neque, blandit nec maximus id, facilisis nec quam. Integer consequat ex porttitor eros rhoncus pretium. Nulla sagittis maximus tristique. Praesent congue mauris libero, in gravida tellus tempus eu. Donec tristique ullamcorper dapibus. Duis eu sodales turpis, et pulvinar elit. Nulla lacinia arcu in sagittis blandit. Aliquam id est a enim facilisis sollicitudin eu sed neque. Interdum et malesuada fames ac ante ipsum primis in faucibus. Duis laoreet, nisl vel tempor mollis, nisl leo interdum elit, ut mollis tellus diam vitae ante. Maecenas porta, felis et sollicitudin aliquam, quam diam gravida neque, a accumsan massa arcu at ligula. Aliquam semper ligula diam, eu aliquet metus tristique vel.",
  },
  {
    body:
      "Donec faucibus urna semper nisi consequat accumsan. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse porttitor pellentesque nisl et lobortis. Praesent mauris nisi, feugiat vel eros id, condimentum dictum enim. Nam tortor dui, luctus ut sem in, fringilla interdum eros. Nulla eget augue et purus rutrum accumsan. Fusce lobortis mauris tortor, eu dignissim orci faucibus ac. Suspendisse nibh felis, sollicitudin eget elit ac, pulvinar semper massa. Pellentesque blandit, est at congue rutrum, velit eros consectetur lorem, sed malesuada tortor libero nec nisi. Proin vehicula egestas ante quis vehicula.",
  },
  {
    body:
      "Maecenas eros diam, efficitur in libero in, auctor pharetra turpis. Sed aliquam, ligula dictum dignissim placerat, massa justo euismod urna, quis eleifend leo ante in arcu. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec dolor lorem, aliquam in hendrerit vitae, condimentum at diam. Nullam elementum eget nibh ac laoreet. Nam ullamcorper a nulla id egestas. Quisque aliquet ornare felis a auctor. Fusce faucibus congue mollis. Nam et ullamcorper felis. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.",
  },
  {
    body:
      "Curabitur pharetra sapien nec libero efficitur, eu auctor felis volutpat. Mauris semper, enim et facilisis dictum, tellus elit rhoncus orci, vel eleifend arcu massa ut odio. Vestibulum ac nunc in nunc vulputate eleifend non id orci. Mauris bibendum dictum purus ac finibus. Phasellus vitae rutrum nunc. In vel lorem vitae erat fringilla venenatis. Phasellus venenatis volutpat pretium. Suspendisse varius imperdiet nisl, ut aliquet libero dignissim vitae. Etiam pharetra pretium ex sed mollis.",
  },
  {
    body:
      "Etiam nec purus ligula. Nam consectetur dapibus nisi sit amet tempus. Morbi sodales viverra sollicitudin. Duis finibus vestibulum metus, quis lobortis arcu finibus eu. Vestibulum ut velit mattis, scelerisque sem et, venenatis velit. Pellentesque eget purus eros. In accumsan, justo in egestas congue, dui massa mollis elit, eu imperdiet dui ante a justo. Phasellus magna sem, mattis eu ligula a, scelerisque convallis elit. Duis venenatis justo quis ligula ornare, eu dictum lacus ornare. Vestibulum mollis efficitur velit, vel tincidunt sem. Vestibulum condimentum finibus nisl eget rhoncus. Vestibulum egestas ornare mauris, eget mattis turpis malesuada vel. Curabitur vel ante sed neque sodales varius. Curabitur at mollis arcu. Cras enim dolor, porta volutpat mattis non, ultrices eleifend sapien. Maecenas neque justo, pretium eget erat vel, lacinia varius dui.",
  },
  {
    body:
      "Ut venenatis luctus neque non commodo. Duis sed est a velit pulvinar facilisis a sed lectus. Donec in sodales nisi, ac venenatis elit. Pellentesque vel blandit massa. Proin lacus metus, molestie non cursus non, facilisis sollicitudin ex. Praesent molestie mollis est, quis venenatis nibh commodo eu. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Praesent dictum tincidunt tempor. Nulla facilisi. Quisque in diam ex. Sed mattis, massa vel rutrum rhoncus, diam est interdum purus, nec porta nulla magna vel nulla. Proin elit turpis, tempor pellentesque sagittis eu, pulvinar sollicitudin sapien. Sed lobortis vehicula sollicitudin. Curabitur nec interdum diam. Donec fringilla faucibus hendrerit.",
  },
];

async function main() {
  // Replace with your email.
  const userName = "agrodellic@gmail.com";

  const logger = log.getLogger("load-data");
  logger.debug("load-data");
  const admin = FirebaseAdmin.init();
  const underlying = admin.firestore();

  // @ts-ignore the admin and client sdk types seem the same, but they are named differently
  const database = FirestoreDatabase.of(underlying);

  const userRecord: UserRecord = {
    userName: userName,
  };
  logger.debug(`adding user ${userRecord.userName}`);
  await database.addUser(userRecord);
  logger.debug(`added user ${userRecord.userName}`);

  const results = notes.map(async (note) => {
    await database.addNote(userRecord.userName, note);
  });

  await Promise.all(results);

  logger.debug(`added all notes`);
}

main();
