# Inventory
Tracks records of stock in the business. It allows for addition of stock, Deleting and also managing settings and other operations.

* This is the source of all the help information about the System

- Home
  - The home page shows the overall statistics of all the entries of stock flows in the system.
  - The graph is meant to represent all the stock flows depending on the branch.
  - For a paticular user, only the branch from which that user works shows up with its data.
  
  * Navigate the Help Information
    [#stock] Stock
        li.list-group-item
              a(href="#flows") Stock Flow
            li.list-group-item
              a(href="#operations") Operations
            li.list-group-item
              a(href="#settings") Settings
            li.list-group-item
              a(href="#login") Login
    #stock.col-md-6
      h3 Stock
      p.jumbotron This lists all the stock items in the system and provides ways
        |   sort and organise the data. It also provides ways of exprting the data
        |   in different forms including MS Excel Spreadsheets among others.
      blockquote It also gives the user the ability to search for stock items.
      ul.list-group
        li.list-group-item
          h4 Adding a stock item
          p Before adding a stock item, the following must exist:
          ul.jumbotron
            li Categories
            li Suppliers
          p The just use the 'Add stock Item' button, fill in the details and save.
          .padding.alert.alert-danger
            h5 #[strong #[em Note:]]
            p All items are added by an Administrator and these Items are visible in all 
              | branches. A branch has to make instances of its items that are received, 
              | sold, or rented. This then generates the stock flow in the business.
            p #[strong Only administrators can edit and delete the Items.]
            p An item can not be deleted if it has an instance in the flows.
            p Editing an item is allowed at any instance.
          p The Administrators are responsible for maintaining the items in the business 
            | and adding them to the system.
  #flows.row
    .col-md-6
      h3 Stock Flows
      p.jumbotron All the stockk instances created by the users depending on the branch
        |  of the current user are displayed here and this page provides for updates and
        |  creation of new stock flow instances.
      blockquote
        p It should be noted that all the items on this page can also be exported 
          |  in different formats as the stock items.
      ul.list-group
        li.list-group-item
          h4 Adding flows
          p Before you add any Stock Item flow, the following must be in the system.
          ul.jumbotron
            li Stock Items
            li Employees
            li Branches
          p For each item, a flow can be created by any user but deleting the flows is 
            | left only to the Administrators
          .padding.alert.alert-info
            h5 #[strong #[em Note]]
            p All flows are just instances of the Stock Items. Deteails of each flow can 
              | be seen by clicking on the eye 
              span.glyphicon.glyphion-eye-open
            p All users can edit the flows for their branches but only those that they 
              | added.

    #operations.col-md-6
      h3 Operations
      p Operations are for the internal business operations and as well as the 
        | the external.
      ul.list-group
        li.list-group-item
          h4 Branches
          p The branches of the business. Each branch can have its own workers and system 
            | users.
          p Branches do not depend on anything to be added.
          .alert.alert-danger
            h5 #[strong #[em Note]]
            p You can not delete a branch if it has an attachment to a User/Worker, or flow.
            p Editin the branch is allowed at any instance.
        li.list-group-item
          h4 Employees
          p These are the workers of the business. They also include the system Users.
          p To add a user/worker to the system, the flowing must be in place;
          ul.jumbotron
            li Roles - especially if you adding a user of the system.
              p for an ordinary worker, this is not required.
            li Positions - required for all
            li Branches - where they work from
          .alert.alert-danger
            h5 #[strong #[em Note]]
            p A user or worker can not be deleted unless he or she has no attachment to 
              | any stock flow.
            p A worker/user can be deactivated so that he/she does not appear when 
              | selecting workers responsible for some flow.
        li.list-group-tem
          h4 Suppliers
          p These supply stock items to the business.
          p No pre-requisites are neccessary to create these.
          .alert.alert-danger
            h5 #[strong #[em Note]]
            p A supplier can not be deleted when attached to an Item already.
  
  #settings.row
    .col-md-6
      h3 Settings
      p These are the settings of the system.
      ul.list-group
        li.list-group-item
          h4 Categories
          p This sets the categories for the products in the business.
        li.list-group-item
          h4 Brands
          p Various item brands.
        li.list-group-item
          h4 Roles
          p User Roles for system management at the diffent branches.
        li.list-group-item
          h4 Positions
          p Worker positions
      .alert.alert-danger
        h5 #[strong #[em Note]]
        p All these can not be deleted when they have instances attached to either a user, 
          | worker, or an Item or flow.

    #login.col-md-6
      h3 Login
      ul.list-group
        li.list-group-item
          p This is for user login/signin to the system.
          p A user can not login if his/her status is Inactive.
          p Workers can not login unless they us credentials of other users.