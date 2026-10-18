-- AbuCooking: datos iniciales (español)

insert into ingredient (slug, is_pantry) values
  ('salt', true), ('olive-oil', true), ('water', true), ('black-pepper', true),
  ('sugar', true), ('vinegar', true),
  ('egg', false), ('potato', false), ('onion', false), ('garlic', false),
  ('tomato', false), ('crushed-tomato', false), ('green-pepper', false), ('red-pepper', false),
  ('carrot', false), ('zucchini', false), ('eggplant', false), ('cucumber', false),
  ('lettuce', false), ('rice', false), ('pasta', false), ('flour', false),
  ('bread', false), ('milk', false), ('butter', false), ('cheese', false),
  ('chicken', false), ('minced-meat', false), ('chorizo', false), ('ham', false),
  ('bacon', false), ('tuna', false), ('cod', false), ('prawns', false),
  ('lentils', false), ('chickpeas', false), ('spinach', false), ('mushrooms', false),
  ('paprika', false), ('bay-leaf', false), ('parsley', false), ('lemon', false),
  ('cinnamon', false), ('chicken-stock', false), ('white-wine', false), ('peas', false),
  ('olives', false), ('avocado', false), ('cumin', false);

insert into ingredient_translation (ingredient_id, locale, name, synonyms)
select i.id, 'es', v.name, v.synonyms
from (values
  ('salt', 'sal', '{}'::text[]),
  ('olive-oil', 'aceite de oliva', '{aceite}'),
  ('water', 'agua', '{}'),
  ('black-pepper', 'pimienta negra', '{pimienta}'),
  ('sugar', 'azúcar', '{}'),
  ('vinegar', 'vinagre', '{}'),
  ('egg', 'huevo', '{huevos}'),
  ('potato', 'patata', '{patatas,papa,papas}'),
  ('onion', 'cebolla', '{cebollas}'),
  ('garlic', 'ajo', '{ajos,"diente de ajo"}'),
  ('tomato', 'tomate', '{tomates}'),
  ('crushed-tomato', 'tomate triturado', '{"tomate frito","tomate en lata"}'),
  ('green-pepper', 'pimiento verde', '{pimiento}'),
  ('red-pepper', 'pimiento rojo', '{pimiento,morrón}'),
  ('carrot', 'zanahoria', '{zanahorias}'),
  ('zucchini', 'calabacín', '{calabacines}'),
  ('eggplant', 'berenjena', '{berenjenas}'),
  ('cucumber', 'pepino', '{pepinos}'),
  ('lettuce', 'lechuga', '{}'),
  ('rice', 'arroz', '{}'),
  ('pasta', 'pasta', '{macarrones,espaguetis,espagueti,fideos,tallarines}'),
  ('flour', 'harina', '{}'),
  ('bread', 'pan', '{"pan duro",barra}'),
  ('milk', 'leche', '{}'),
  ('butter', 'mantequilla', '{}'),
  ('cheese', 'queso', '{"queso rallado",parmesano}'),
  ('chicken', 'pollo', '{"pechuga de pollo",muslos}'),
  ('minced-meat', 'carne picada', '{"carne de ternera",picada}'),
  ('chorizo', 'chorizo', '{}'),
  ('ham', 'jamón serrano', '{jamón}'),
  ('bacon', 'bacon', '{beicon,panceta,tocino}'),
  ('tuna', 'atún', '{"atún en lata",bonito}'),
  ('cod', 'bacalao', '{merluza,"pescado blanco"}'),
  ('prawns', 'gambas', '{langostinos}'),
  ('lentils', 'lentejas', '{}'),
  ('chickpeas', 'garbanzos', '{}'),
  ('spinach', 'espinacas', '{}'),
  ('mushrooms', 'champiñones', '{setas,champiñón}'),
  ('paprika', 'pimentón', '{"pimentón dulce"}'),
  ('bay-leaf', 'laurel', '{"hoja de laurel"}'),
  ('parsley', 'perejil', '{}'),
  ('lemon', 'limón', '{limones}'),
  ('cinnamon', 'canela', '{}'),
  ('chicken-stock', 'caldo de pollo', '{caldo}'),
  ('white-wine', 'vino blanco', '{vino}'),
  ('peas', 'guisantes', '{}'),
  ('olives', 'aceitunas', '{olivas}'),
  ('avocado', 'aguacate', '{aguacates}'),
  ('cumin', 'comino', '{}')
) as v(slug, name, synonyms)
join ingredient i on i.slug = v.slug;

insert into recipe (slug, prep_minutes, servings) values
  ('tortilla-de-patatas', 45, 4),
  ('huevos-rotos-con-jamon', 30, 2),
  ('lentejas-con-chorizo', 60, 4),
  ('garbanzos-con-espinacas', 25, 4),
  ('gazpacho', 15, 4),
  ('salmorejo', 15, 4),
  ('espaguetis-a-la-bolonesa', 40, 4),
  ('macarrones-a-la-carbonara', 20, 4),
  ('arroz-a-la-cubana', 30, 4),
  ('pollo-al-ajillo', 45, 4),
  ('crema-de-calabacin', 35, 4),
  ('ensalada-mixta', 15, 2),
  ('pisto', 50, 4),
  ('gambas-al-ajillo', 15, 2),
  ('champinones-al-ajillo', 15, 2),
  ('arroz-con-pollo', 50, 4),
  ('albondigas-en-salsa', 60, 4),
  ('bacalao-con-tomate', 35, 4),
  ('torrijas', 30, 6),
  ('arroz-con-leche', 50, 6),
  ('guacamole', 10, 4),
  ('patatas-a-la-riojana', 50, 4),
  ('revuelto-de-champinones-y-jamon', 15, 2),
  ('crepes', 30, 4),
  ('pollo-al-limon', 30, 4),
  ('pure-de-patatas', 30, 4);

insert into recipe_translation (recipe_id, locale, title, description, steps)
select r.id, 'es', v.title, v.description, v.steps
from (values
  ('tortilla-de-patatas', 'Tortilla de patatas', 'El clásico de siempre, con o sin cebolla.', array[
    'Pela las patatas y córtalas en láminas finas. Pica la cebolla si la usas.',
    'Fríe las patatas (y la cebolla) a fuego medio en abundante aceite unos 20 minutos, hasta que estén tiernas.',
    'Escúrrelas bien y mézclalas con los huevos batidos y sal. Deja reposar 5 minutos.',
    'Cuaja la mezcla en una sartén con un poco de aceite, dale la vuelta con un plato y termina por el otro lado.'
  ]),
  ('huevos-rotos-con-jamon', 'Huevos rotos con jamón', 'Patatas fritas, huevo frito y jamón: no falla.', array[
    'Corta las patatas en bastones o rodajas finas y fríelas en aceite hasta que estén doradas. Sala.',
    'Fríe los huevos dejando la yema líquida.',
    'Coloca los huevos sobre las patatas, añade el jamón y rompe las yemas al servir.'
  ]),
  ('lentejas-con-chorizo', 'Lentejas con chorizo', 'Plato de cuchara de toda la vida.', array[
    'Pica la cebolla, el ajo, el pimiento y la zanahoria, y sofríelos en una olla con aceite.',
    'Añade el chorizo en rodajas y el pimentón, y remueve un minuto sin que se queme.',
    'Incorpora las lentejas, la patata troceada y el laurel, y cubre con agua.',
    'Cuece a fuego lento unos 40 minutos, hasta que las lentejas estén tiernas. Rectifica de sal.'
  ]),
  ('garbanzos-con-espinacas', 'Garbanzos con espinacas', 'Receta sevillana rápida con garbanzos cocidos.', array[
    'Fríe los ajos laminados y el pan en aceite. Retira y machácalos en un mortero con el comino, el pimentón y un chorrito de vinagre.',
    'En el mismo aceite saltea las espinacas hasta que reduzcan.',
    'Añade los garbanzos escurridos, el majado y un poco de agua. Cocina 10 minutos y sala al gusto.'
  ]),
  ('gazpacho', 'Gazpacho', 'Sopa fría andaluza, perfecta para el verano.', array[
    'Trocea los tomates, el pimiento, el pepino pelado y el ajo.',
    'Tritúralo todo con el pan remojado, el aceite, el vinagre y la sal.',
    'Añade agua fría hasta conseguir la textura deseada, cuela si quieres y enfría en la nevera.'
  ]),
  ('salmorejo', 'Salmorejo', 'Crema fría cordobesa de tomate y pan.', array[
    'Tritura los tomates con el ajo y la sal.',
    'Añade el pan troceado, deja que se empape 10 minutos y vuelve a triturar.',
    'Emulsiona añadiendo el aceite poco a poco mientras trituras.',
    'Sirve frío con huevo duro y jamón picado por encima.'
  ]),
  ('espaguetis-a-la-bolonesa', 'Espaguetis a la boloñesa', 'Pasta con salsa de carne y tomate.', array[
    'Pica la cebolla, la zanahoria y el ajo, y sofríelos en aceite 10 minutos.',
    'Añade la carne picada, salpimienta y dórala bien. Riega con el vino y deja evaporar.',
    'Incorpora el tomate triturado y cocina a fuego lento 20 minutos.',
    'Cuece la pasta, escúrrela, mézclala con la salsa y sirve con queso rallado.'
  ]),
  ('macarrones-a-la-carbonara', 'Macarrones a la carbonara', 'Versión sin nata: huevo, queso y bacon.', array[
    'Cuece la pasta en agua con sal.',
    'Mientras tanto, dora el bacon en una sartén sin aceite.',
    'Bate las yemas con el queso rallado y bastante pimienta.',
    'Fuera del fuego, mezcla la pasta escurrida con el bacon y la crema de huevo, añadiendo un poco del agua de cocción hasta que quede cremosa.'
  ]),
  ('arroz-a-la-cubana', 'Arroz a la cubana', 'Arroz blanco, tomate y huevo frito.', array[
    'Dora los ajos en aceite, añade el arroz, remueve y cubre con el doble de agua. Sala y cuece 18 minutos.',
    'Calienta el tomate triturado en un cazo.',
    'Fríe los huevos y sirve el arroz con el tomate y un huevo por persona.'
  ]),
  ('pollo-al-ajillo', 'Pollo al ajillo', 'Pollo dorado con mucho ajo y vino blanco.', array[
    'Trocea el pollo, salpimiéntalo y dóralo en una cazuela con aceite.',
    'Añade los ajos enteros con piel, un poco golpeados, y el laurel, y sofríe unos minutos.',
    'Riega con el vino blanco, tapa y cocina a fuego lento 25 minutos.',
    'Termina con perejil picado.'
  ]),
  ('crema-de-calabacin', 'Crema de calabacín', 'Crema suave y ligera.', array[
    'Pocha la cebolla en aceite. Añade el calabacín y la patata troceados.',
    'Cubre con caldo o agua, salpimienta y cuece 20 minutos.',
    'Tritura con el queso hasta que quede fina.'
  ]),
  ('ensalada-mixta', 'Ensalada mixta', 'La ensalada de toda la vida.', array[
    'Cuece los huevos 10 minutos, enfríalos y pélalos.',
    'Lava y trocea la lechuga, el tomate, la cebolla y la zanahoria rallada.',
    'Añade el atún, los huevos en cuartos y las aceitunas.',
    'Aliña con aceite, vinagre y sal.'
  ]),
  ('pisto', 'Pisto', 'Verduras pochadas con tomate.', array[
    'Pica la cebolla, el ajo y los pimientos, y pócalos en aceite 10 minutos.',
    'Añade el calabacín y la berenjena en dados y cocina 15 minutos más.',
    'Incorpora el tomate triturado, el azúcar y la sal, y deja reducir 15 minutos.'
  ]),
  ('gambas-al-ajillo', 'Gambas al ajillo', 'Tapa clásica en cazuela de barro.', array[
    'Calienta aceite en una cazuela con los ajos laminados.',
    'Cuando los ajos empiecen a dorarse, añade las gambas peladas y sala.',
    'Cocina 2 minutos, espolvorea perejil y sirve muy caliente.'
  ]),
  ('champinones-al-ajillo', 'Champiñones al ajillo', 'Tapa rápida y sabrosa.', array[
    'Limpia y lamina los champiñones.',
    'Dora los ajos picados en aceite, añade los champiñones y saltéalos a fuego fuerte.',
    'Riega con el vino, deja evaporar, sala y termina con perejil.'
  ]),
  ('arroz-con-pollo', 'Arroz con pollo', 'Arroz caldoso o seco, al gusto.', array[
    'Dora el pollo troceado en aceite y resérvalo.',
    'Sofríe la cebolla, el ajo y el pimiento. Añade el tomate y el pimentón.',
    'Incorpora el arroz y el pollo, cubre con el caldo caliente y añade los guisantes.',
    'Cuece 18 minutos, rectifica de sal y deja reposar 5 minutos.'
  ]),
  ('albondigas-en-salsa', 'Albóndigas en salsa', 'Como las de la abuela.', array[
    'Mezcla la carne con el huevo, el ajo y el perejil picados, el pan remojado en leche y sal.',
    'Forma bolas, pásalas por harina y fríelas. Resérvalas.',
    'En el mismo aceite pocha la cebolla y la zanahoria. Añade el vino y el caldo y cuece 10 minutos.',
    'Tritura la salsa, añade las albóndigas y cocina 15 minutos más.'
  ]),
  ('bacalao-con-tomate', 'Bacalao con tomate', 'Pescado en salsa de tomate casera.', array[
    'Pocha la cebolla, el pimiento y el ajo en aceite.',
    'Añade el tomate triturado y el azúcar, y cocina 15 minutos.',
    'Enharina los lomos de bacalao, dóralos y pásalos a la salsa. Cocina 5 minutos más.'
  ]),
  ('torrijas', 'Torrijas', 'Postre tradicional de Semana Santa.', array[
    'Calienta la leche con la canela, la piel de limón y la mitad del azúcar. Deja templar.',
    'Corta el pan en rebanadas gruesas y empápalas en la leche.',
    'Pásalas por huevo batido y fríelas en aceite caliente.',
    'Rebózalas en el azúcar restante mezclado con canela.'
  ]),
  ('arroz-con-leche', 'Arroz con leche', 'Postre cremoso de la abuela.', array[
    'Calienta la leche con la canela y la piel de limón.',
    'Añade el arroz y cuece a fuego lento 40 minutos, removiendo a menudo.',
    'Agrega el azúcar y la mantequilla y cocina 5 minutos más. Sirve frío con canela en polvo.'
  ]),
  ('guacamole', 'Guacamole', 'Para picar con nachos o acompañar.', array[
    'Machaca la pulpa de los aguacates con un tenedor.',
    'Añade el tomate y la cebolla muy picados.',
    'Aliña con zumo de limón y sal.'
  ]),
  ('patatas-a-la-riojana', 'Patatas a la riojana', 'Guiso de patatas con chorizo.', array[
    'Sofríe la cebolla, el pimiento y el ajo en aceite.',
    'Añade el chorizo en rodajas y el pimentón.',
    'Incorpora las patatas "cascadas" (troceadas rompiéndolas) y el laurel, y cubre con agua.',
    'Cuece 25 minutos a fuego medio hasta que la salsa espese. Sala.'
  ]),
  ('revuelto-de-champinones-y-jamon', 'Revuelto de champiñones y jamón', 'Cena rápida en 15 minutos.', array[
    'Saltea los champiñones laminados con el ajo en aceite.',
    'Añade el jamón en tiras y remueve un minuto.',
    'Incorpora los huevos batidos y remueve a fuego suave hasta que cuajen jugosos. Sala.'
  ]),
  ('crepes', 'Crepes', 'Base para rellenos dulces o salados.', array[
    'Bate la harina, la leche, los huevos, la mantequilla derretida, una pizca de sal y el azúcar.',
    'Deja reposar la masa 15 minutos.',
    'Vierte un cazo de masa en una sartén caliente y untada en mantequilla, y extiéndela. Dale la vuelta cuando se despegue.'
  ]),
  ('pollo-al-limon', 'Pollo al limón', 'Pechugas jugosas con salsa de limón.', array[
    'Corta las pechugas en filetes, salpimiéntalos y enharínalos.',
    'Dóralos en aceite con el ajo laminado.',
    'Añade el zumo de los limones y el caldo, y cocina 5 minutos hasta que espese. Termina con perejil.'
  ]),
  ('pure-de-patatas', 'Puré de patatas', 'Guarnición cremosa.', array[
    'Cuece las patatas peladas en agua con sal unos 20 minutos.',
    'Escúrrelas y aplástalas con la mantequilla.',
    'Añade la leche caliente poco a poco hasta conseguir la textura deseada. Salpimienta.'
  ])
) as v(slug, title, description, steps)
join recipe r on r.slug = v.slug;

-- (receta, ingrediente, cantidad, unidad, opcional)
insert into recipe_ingredient (recipe_id, ingredient_id, quantity, unit, optional, position)
select r.id, i.id, v.quantity, v.unit, v.optional, v.position
from (values
  ('tortilla-de-patatas', 'egg', 6, 'ud', false, 1),
  ('tortilla-de-patatas', 'potato', 600, 'g', false, 2),
  ('tortilla-de-patatas', 'onion', 1, 'ud', true, 3),
  ('tortilla-de-patatas', 'olive-oil', 250, 'ml', false, 4),
  ('tortilla-de-patatas', 'salt', null, null, false, 5),

  ('huevos-rotos-con-jamon', 'potato', 500, 'g', false, 1),
  ('huevos-rotos-con-jamon', 'egg', 4, 'ud', false, 2),
  ('huevos-rotos-con-jamon', 'ham', 100, 'g', false, 3),
  ('huevos-rotos-con-jamon', 'olive-oil', 200, 'ml', false, 4),
  ('huevos-rotos-con-jamon', 'salt', null, null, false, 5),

  ('lentejas-con-chorizo', 'lentils', 300, 'g', false, 1),
  ('lentejas-con-chorizo', 'chorizo', 150, 'g', false, 2),
  ('lentejas-con-chorizo', 'potato', 2, 'ud', false, 3),
  ('lentejas-con-chorizo', 'carrot', 2, 'ud', false, 4),
  ('lentejas-con-chorizo', 'onion', 1, 'ud', false, 5),
  ('lentejas-con-chorizo', 'garlic', 2, 'dientes', false, 6),
  ('lentejas-con-chorizo', 'green-pepper', 1, 'ud', true, 7),
  ('lentejas-con-chorizo', 'paprika', 1, 'cdta', false, 8),
  ('lentejas-con-chorizo', 'bay-leaf', 1, 'hoja', true, 9),
  ('lentejas-con-chorizo', 'olive-oil', 3, 'cda', false, 10),
  ('lentejas-con-chorizo', 'water', null, null, false, 11),
  ('lentejas-con-chorizo', 'salt', null, null, false, 12),

  ('garbanzos-con-espinacas', 'chickpeas', 400, 'g', false, 1),
  ('garbanzos-con-espinacas', 'spinach', 300, 'g', false, 2),
  ('garbanzos-con-espinacas', 'garlic', 3, 'dientes', false, 3),
  ('garbanzos-con-espinacas', 'bread', 1, 'rebanada', true, 4),
  ('garbanzos-con-espinacas', 'paprika', 1, 'cdta', false, 5),
  ('garbanzos-con-espinacas', 'cumin', 0.5, 'cdta', true, 6),
  ('garbanzos-con-espinacas', 'vinegar', 1, 'cda', false, 7),
  ('garbanzos-con-espinacas', 'olive-oil', 4, 'cda', false, 8),
  ('garbanzos-con-espinacas', 'salt', null, null, false, 9),

  ('gazpacho', 'tomato', 1000, 'g', false, 1),
  ('gazpacho', 'green-pepper', 1, 'ud', false, 2),
  ('gazpacho', 'cucumber', 1, 'ud', false, 3),
  ('gazpacho', 'garlic', 1, 'diente', false, 4),
  ('gazpacho', 'bread', 50, 'g', true, 5),
  ('gazpacho', 'olive-oil', 100, 'ml', false, 6),
  ('gazpacho', 'vinegar', 2, 'cda', false, 7),
  ('gazpacho', 'water', null, null, false, 8),
  ('gazpacho', 'salt', null, null, false, 9),

  ('salmorejo', 'tomato', 1000, 'g', false, 1),
  ('salmorejo', 'bread', 200, 'g', false, 2),
  ('salmorejo', 'garlic', 1, 'diente', false, 3),
  ('salmorejo', 'egg', 2, 'ud', true, 4),
  ('salmorejo', 'ham', 50, 'g', true, 5),
  ('salmorejo', 'olive-oil', 150, 'ml', false, 6),
  ('salmorejo', 'salt', null, null, false, 7),

  ('espaguetis-a-la-bolonesa', 'pasta', 400, 'g', false, 1),
  ('espaguetis-a-la-bolonesa', 'minced-meat', 400, 'g', false, 2),
  ('espaguetis-a-la-bolonesa', 'crushed-tomato', 400, 'g', false, 3),
  ('espaguetis-a-la-bolonesa', 'onion', 1, 'ud', false, 4),
  ('espaguetis-a-la-bolonesa', 'carrot', 1, 'ud', false, 5),
  ('espaguetis-a-la-bolonesa', 'garlic', 2, 'dientes', false, 6),
  ('espaguetis-a-la-bolonesa', 'white-wine', 100, 'ml', true, 7),
  ('espaguetis-a-la-bolonesa', 'cheese', 50, 'g', true, 8),
  ('espaguetis-a-la-bolonesa', 'olive-oil', 3, 'cda', false, 9),
  ('espaguetis-a-la-bolonesa', 'salt', null, null, false, 10),
  ('espaguetis-a-la-bolonesa', 'black-pepper', null, null, false, 11),

  ('macarrones-a-la-carbonara', 'pasta', 400, 'g', false, 1),
  ('macarrones-a-la-carbonara', 'bacon', 200, 'g', false, 2),
  ('macarrones-a-la-carbonara', 'egg', 3, 'yemas', false, 3),
  ('macarrones-a-la-carbonara', 'cheese', 80, 'g', false, 4),
  ('macarrones-a-la-carbonara', 'black-pepper', null, null, false, 5),
  ('macarrones-a-la-carbonara', 'salt', null, null, false, 6),

  ('arroz-a-la-cubana', 'rice', 300, 'g', false, 1),
  ('arroz-a-la-cubana', 'egg', 4, 'ud', false, 2),
  ('arroz-a-la-cubana', 'crushed-tomato', 400, 'g', false, 3),
  ('arroz-a-la-cubana', 'garlic', 2, 'dientes', true, 4),
  ('arroz-a-la-cubana', 'olive-oil', 4, 'cda', false, 5),
  ('arroz-a-la-cubana', 'water', 600, 'ml', false, 6),
  ('arroz-a-la-cubana', 'salt', null, null, false, 7),

  ('pollo-al-ajillo', 'chicken', 1000, 'g', false, 1),
  ('pollo-al-ajillo', 'garlic', 8, 'dientes', false, 2),
  ('pollo-al-ajillo', 'white-wine', 150, 'ml', false, 3),
  ('pollo-al-ajillo', 'bay-leaf', 1, 'hoja', true, 4),
  ('pollo-al-ajillo', 'parsley', null, null, true, 5),
  ('pollo-al-ajillo', 'olive-oil', 4, 'cda', false, 6),
  ('pollo-al-ajillo', 'salt', null, null, false, 7),
  ('pollo-al-ajillo', 'black-pepper', null, null, false, 8),

  ('crema-de-calabacin', 'zucchini', 3, 'ud', false, 1),
  ('crema-de-calabacin', 'onion', 1, 'ud', false, 2),
  ('crema-de-calabacin', 'potato', 1, 'ud', false, 3),
  ('crema-de-calabacin', 'cheese', 60, 'g', true, 4),
  ('crema-de-calabacin', 'chicken-stock', 500, 'ml', true, 5),
  ('crema-de-calabacin', 'olive-oil', 2, 'cda', false, 6),
  ('crema-de-calabacin', 'salt', null, null, false, 7),
  ('crema-de-calabacin', 'black-pepper', null, null, false, 8),

  ('ensalada-mixta', 'lettuce', 1, 'ud', false, 1),
  ('ensalada-mixta', 'tomato', 2, 'ud', false, 2),
  ('ensalada-mixta', 'tuna', 2, 'latas', false, 3),
  ('ensalada-mixta', 'egg', 2, 'ud', false, 4),
  ('ensalada-mixta', 'onion', 0.5, 'ud', true, 5),
  ('ensalada-mixta', 'carrot', 1, 'ud', true, 6),
  ('ensalada-mixta', 'olives', 50, 'g', true, 7),
  ('ensalada-mixta', 'olive-oil', null, null, false, 8),
  ('ensalada-mixta', 'vinegar', null, null, false, 9),
  ('ensalada-mixta', 'salt', null, null, false, 10),

  ('pisto', 'zucchini', 1, 'ud', false, 1),
  ('pisto', 'eggplant', 1, 'ud', false, 2),
  ('pisto', 'green-pepper', 1, 'ud', false, 3),
  ('pisto', 'red-pepper', 1, 'ud', false, 4),
  ('pisto', 'onion', 1, 'ud', false, 5),
  ('pisto', 'crushed-tomato', 400, 'g', false, 6),
  ('pisto', 'garlic', 2, 'dientes', true, 7),
  ('pisto', 'sugar', 1, 'cdta', false, 8),
  ('pisto', 'olive-oil', 4, 'cda', false, 9),
  ('pisto', 'salt', null, null, false, 10),

  ('gambas-al-ajillo', 'prawns', 400, 'g', false, 1),
  ('gambas-al-ajillo', 'garlic', 6, 'dientes', false, 2),
  ('gambas-al-ajillo', 'parsley', null, null, true, 3),
  ('gambas-al-ajillo', 'olive-oil', 100, 'ml', false, 4),
  ('gambas-al-ajillo', 'salt', null, null, false, 5),

  ('champinones-al-ajillo', 'mushrooms', 400, 'g', false, 1),
  ('champinones-al-ajillo', 'garlic', 4, 'dientes', false, 2),
  ('champinones-al-ajillo', 'white-wine', 50, 'ml', true, 3),
  ('champinones-al-ajillo', 'parsley', null, null, true, 4),
  ('champinones-al-ajillo', 'olive-oil', 3, 'cda', false, 5),
  ('champinones-al-ajillo', 'salt', null, null, false, 6),

  ('arroz-con-pollo', 'rice', 300, 'g', false, 1),
  ('arroz-con-pollo', 'chicken', 500, 'g', false, 2),
  ('arroz-con-pollo', 'red-pepper', 1, 'ud', false, 3),
  ('arroz-con-pollo', 'onion', 1, 'ud', false, 4),
  ('arroz-con-pollo', 'garlic', 2, 'dientes', false, 5),
  ('arroz-con-pollo', 'crushed-tomato', 200, 'g', false, 6),
  ('arroz-con-pollo', 'peas', 100, 'g', true, 7),
  ('arroz-con-pollo', 'paprika', 1, 'cdta', false, 8),
  ('arroz-con-pollo', 'chicken-stock', 900, 'ml', true, 9),
  ('arroz-con-pollo', 'olive-oil', 4, 'cda', false, 10),
  ('arroz-con-pollo', 'salt', null, null, false, 11),

  ('albondigas-en-salsa', 'minced-meat', 500, 'g', false, 1),
  ('albondigas-en-salsa', 'egg', 1, 'ud', false, 2),
  ('albondigas-en-salsa', 'bread', 1, 'rebanada', false, 3),
  ('albondigas-en-salsa', 'milk', 50, 'ml', true, 4),
  ('albondigas-en-salsa', 'garlic', 2, 'dientes', false, 5),
  ('albondigas-en-salsa', 'parsley', null, null, true, 6),
  ('albondigas-en-salsa', 'flour', 50, 'g', false, 7),
  ('albondigas-en-salsa', 'onion', 1, 'ud', false, 8),
  ('albondigas-en-salsa', 'carrot', 1, 'ud', false, 9),
  ('albondigas-en-salsa', 'white-wine', 100, 'ml', true, 10),
  ('albondigas-en-salsa', 'chicken-stock', 300, 'ml', true, 11),
  ('albondigas-en-salsa', 'olive-oil', 100, 'ml', false, 12),
  ('albondigas-en-salsa', 'salt', null, null, false, 13),

  ('bacalao-con-tomate', 'cod', 4, 'lomos', false, 1),
  ('bacalao-con-tomate', 'crushed-tomato', 500, 'g', false, 2),
  ('bacalao-con-tomate', 'onion', 1, 'ud', false, 3),
  ('bacalao-con-tomate', 'green-pepper', 1, 'ud', true, 4),
  ('bacalao-con-tomate', 'garlic', 2, 'dientes', false, 5),
  ('bacalao-con-tomate', 'flour', 30, 'g', true, 6),
  ('bacalao-con-tomate', 'sugar', 1, 'cdta', false, 7),
  ('bacalao-con-tomate', 'olive-oil', 4, 'cda', false, 8),
  ('bacalao-con-tomate', 'salt', null, null, false, 9),

  ('torrijas', 'bread', 1, 'barra', false, 1),
  ('torrijas', 'milk', 500, 'ml', false, 2),
  ('torrijas', 'egg', 2, 'ud', false, 3),
  ('torrijas', 'sugar', 100, 'g', false, 4),
  ('torrijas', 'cinnamon', 1, 'rama', false, 5),
  ('torrijas', 'lemon', 1, 'piel', true, 6),
  ('torrijas', 'olive-oil', 300, 'ml', false, 7),

  ('arroz-con-leche', 'rice', 150, 'g', false, 1),
  ('arroz-con-leche', 'milk', 1000, 'ml', false, 2),
  ('arroz-con-leche', 'sugar', 120, 'g', false, 3),
  ('arroz-con-leche', 'cinnamon', 1, 'rama', false, 4),
  ('arroz-con-leche', 'lemon', 1, 'piel', true, 5),
  ('arroz-con-leche', 'butter', 15, 'g', true, 6),

  ('guacamole', 'avocado', 2, 'ud', false, 1),
  ('guacamole', 'tomato', 1, 'ud', true, 2),
  ('guacamole', 'onion', 0.5, 'ud', true, 3),
  ('guacamole', 'lemon', 1, 'ud', false, 4),
  ('guacamole', 'salt', null, null, false, 5),

  ('patatas-a-la-riojana', 'potato', 1000, 'g', false, 1),
  ('patatas-a-la-riojana', 'chorizo', 200, 'g', false, 2),
  ('patatas-a-la-riojana', 'onion', 1, 'ud', false, 3),
  ('patatas-a-la-riojana', 'green-pepper', 1, 'ud', true, 4),
  ('patatas-a-la-riojana', 'garlic', 2, 'dientes', false, 5),
  ('patatas-a-la-riojana', 'paprika', 1, 'cdta', false, 6),
  ('patatas-a-la-riojana', 'bay-leaf', 1, 'hoja', true, 7),
  ('patatas-a-la-riojana', 'olive-oil', 3, 'cda', false, 8),
  ('patatas-a-la-riojana', 'water', null, null, false, 9),
  ('patatas-a-la-riojana', 'salt', null, null, false, 10),

  ('revuelto-de-champinones-y-jamon', 'egg', 4, 'ud', false, 1),
  ('revuelto-de-champinones-y-jamon', 'mushrooms', 250, 'g', false, 2),
  ('revuelto-de-champinones-y-jamon', 'ham', 80, 'g', false, 3),
  ('revuelto-de-champinones-y-jamon', 'garlic', 1, 'diente', true, 4),
  ('revuelto-de-champinones-y-jamon', 'olive-oil', 2, 'cda', false, 5),
  ('revuelto-de-champinones-y-jamon', 'salt', null, null, false, 6),

  ('crepes', 'flour', 125, 'g', false, 1),
  ('crepes', 'milk', 250, 'ml', false, 2),
  ('crepes', 'egg', 2, 'ud', false, 3),
  ('crepes', 'butter', 25, 'g', false, 4),
  ('crepes', 'sugar', 1, 'cda', true, 5),
  ('crepes', 'salt', null, null, false, 6),

  ('pollo-al-limon', 'chicken', 4, 'pechugas', false, 1),
  ('pollo-al-limon', 'lemon', 2, 'ud', false, 2),
  ('pollo-al-limon', 'garlic', 2, 'dientes', false, 3),
  ('pollo-al-limon', 'flour', 30, 'g', true, 4),
  ('pollo-al-limon', 'chicken-stock', 150, 'ml', true, 5),
  ('pollo-al-limon', 'parsley', null, null, true, 6),
  ('pollo-al-limon', 'olive-oil', 3, 'cda', false, 7),
  ('pollo-al-limon', 'salt', null, null, false, 8),
  ('pollo-al-limon', 'black-pepper', null, null, false, 9),

  ('pure-de-patatas', 'potato', 1000, 'g', false, 1),
  ('pure-de-patatas', 'milk', 200, 'ml', false, 2),
  ('pure-de-patatas', 'butter', 50, 'g', false, 3),
  ('pure-de-patatas', 'salt', null, null, false, 4),
  ('pure-de-patatas', 'black-pepper', null, null, false, 5)
) as v(recipe_slug, ingredient_slug, quantity, unit, optional, position)
join recipe r on r.slug = v.recipe_slug
join ingredient i on i.slug = v.ingredient_slug;
