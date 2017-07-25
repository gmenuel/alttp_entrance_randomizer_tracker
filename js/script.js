Set.prototype.difference = function(setB) {
    let difference = new Set(this);
    for (let elem of setB) {
        difference.delete(elem);
    }
    return difference;
}

$( function() {
  let locations = [];

  let randomizer_mode = "normal";
  let door_locations = window.door_locations;
  let caves = window.caves;

  $("#add_location_text_door").autocomplete({
    source: [],
    minLength: 0,
  });
  $("#add_location_text_door").click(function(item) {
    $(this).autocomplete("search", this.value);
  });

  $("#add_location_text_cave").autocomplete({
    source: Object.keys(caves).filter(function(item) { return item != "Useless"; }).sort(),
    minLength: 0,
  });
  $("#add_location_text_cave").click(function(item) {
    $(this).autocomplete("search", this.value);
  });

  $("#add_location_form").submit(function(event) {
    let text_door = $("#add_location_text_door").val();
    let text_cave = $("#add_location_text_cave").val();
    locations.push({
      "door": text_door,
      "cave": text_cave,
      "exit": text_door,
    });
    refreshList();
    $("#add_location_text_door").val("");
    $("#add_location_text_cave").val("");
    $("#add_location_text_door").focus();
    event.preventDefault();
  });
  $("#add_location_clear").click(function(event) {
    $("#add_location_text_door").val("");
    $("#add_location_text_cave").val("");
    $("#add_location_text_door").focus();
  });

  $('#locations_table').on('click', 'a.editor_remove', function (e) {
    e.preventDefault();
    let tr = $(this).closest('tr')[0];
    let td = tr.firstChild;
    s = td.textContent;
    locations = locations.filter(function(item) {
      return item.door != s;
    });
    refreshList();
  });
  $('#locations_table').DataTable({
    paging: false,
    info: false,
    columns: [
      { "data": "door"},
      { "data": "cave"},
      { "data": "exit"},
      {
        data: null,
        orderable: false,
        className: "center",
        defaultContent: '<a href="" class="editor_remove">Delete</a>'
      },
    ],
  });
  $('#unvisited_doors_table').on('click', 'a.editor_useless', function (e) {
    e.preventDefault();
    let tr = $(this).closest('tr')[0];
    let td = tr.firstChild;
    let s = td.textContent;
    locations.push({
      "door": s,
      "cave": "Useless",
      "exit": s,
    });
    refreshList();
  });
  $('#unvisited_doors_table').DataTable({
    paging: false,
    info: false,
    columns: [
      { "data": "name"},
      { "data": "region"},
      {
        data: null,
        orderable: false,
        className: "center",
        defaultContent: '<a href="" class="editor_useless">Useless</a>'
      },
      {
        "data": "tag",
        "visible": false,
        "searchable": true,
      }
    ],
  });
  $('#unvisited_caves_table').DataTable({
    paging: false,
    info: false,
    columns: [
      { "data": "name"},
      { "data": "count"},
    ],
  });

  function refreshList() {
    let locations_table = $("#locations_table").dataTable().api();
    let unvisited_doors_table = $("#unvisited_doors_table").dataTable().api();
    let unvisited_caves_table = $("#unvisited_caves_table").dataTable().api();

    let all_doors = new Set();
    for(let name of Object.keys(door_locations)) {
      all_doors.add(name);
    }
    let found_door = new Set();

    let all_caves = new Set();
    for(let name of Object.keys(caves)) {
      if(name != "Useless")
        all_caves.add(name);
    }
    let found_caves = new Set();
    all_caves.delete(caves[0]);

    let locations_array = [];
    for(let item of locations) {
      found_door.add(item.door);
      found_caves.add(item.cave);
      locations_array.push({
        "door": item.door,
        "cave": item.cave,
        "exit": item.exit,
      });
    }
    locations_table.clear();
    locations_table.rows.add(locations_array);
    locations_table.rows().invalidate().draw();

    // Update the unvisited doors model
    let unvisited_doors = all_doors.difference(found_door);
    let unvisited_doors_array = [];
    for(let item of unvisited_doors) {
      let location = door_locations[item];
      unvisited_doors_array.push({
        "name": item,
        "region": location.region,
        "tag": "tag" in location ? location.tag : "",
      });
    }
    unvisited_doors_table.clear();
    unvisited_doors_table.rows.add(unvisited_doors_array);
    unvisited_doors_table.rows().invalidate().draw();
    $("#add_location_text_door").autocomplete("option", "source", Array.from(unvisited_doors).sort());

    // Update the unvisited caves model
    let unvisited_caves = all_caves.difference(found_caves);
    let unvisited_caves_array = [];
    for(let item of unvisited_caves) {
      unvisited_caves_array.push({
        "name": item,
        "count": caves[item].count,
      });
    }
    unvisited_caves_table.clear();
    unvisited_caves_table.rows.add(unvisited_caves_array);
    unvisited_caves_table.rows().invalidate().draw();
  }

  refreshList();
});
