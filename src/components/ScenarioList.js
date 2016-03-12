var React = require('react');
var assert = require('assert');
var Griddle = require('griddle-react');
var {PER_PAGE} = require('../constants');
var {Navigation, State} = require('react-router');
var componentHelper = require('../components/helper');
var Actions = require('../actions');
var CustomPager = require('./CustomPager');
var _ = require('underscore');
var {getAncestorFromEventTargetByClass} = require('../tools/dom');



var Entries = React.createClass({
  render() {
    if (!this.props.data) return <div></div>;
    return (
      <div>
        {this.props.data.map(entry => {
          var tooltip = entry.title + (entry.title && entry.css ? '\n\n' : '') + entry.css;
          return (
            <div className="paged-table--scenario-list__entry" title={tooltip} key={entry._id}>
              {componentHelper.renderIcon(entry.isBlock, entry.mode, entry.type)}
            </div>
          );
        })}
      </div>
    );
  }
});

var IsBlock = React.createClass({
  render() {
    return (<div>
      {this.props.data ? <i className="fa fa-cube"></i> : ""}
    </div>);
  }
});

var Buttons = React.createClass({
  render() {
    return (<div>
      <button className="btn btn-xs btn-link fa fa-trash" onClick={this.onDeleteClick}></button>
    </div>);
  },
  onDeleteClick(e) {
    e.stopPropagation();
    e.preventDefault();
    Actions.deleteScenario(this.props.rowData);
  }
});

var Columns = ['title', 'entries', 'updatedBy', 'isBlock', 'buttons'];
var ColumnMetadata = [
  {
    'columnName': 'title',
    'displayName': 'タイトル',
    'visible': true,
    'cssClassName': 'cell cell--title'
  },
  {
    'columnName': 'entries',
    'displayName': 'ステップ',
    'visible': true,
    'customComponent': Entries,
    'cssClassName': 'cell cell--entries'
  },
  {
    'columnName': 'updatedBy',
    'displayName': '更新者',
    'visible': true,
    'cssClassName': 'cell cell--updatedBy'
  },
  {
    'columnName': 'isBlock',
    'displayName': 'ブロック',
    'visible': true,
    'customComponent': IsBlock,
    'cssClassName': 'cell cell--isBlock'
  },
  {
    'columnName': 'buttons',
    'displayName': '',
    'visible': true,
    'customComponent': Buttons,
    'cssClassName': 'cell cell--buttons'
  }
];

var ScenarioListComponent = React.createClass({

    getInitialState() {
      return _.extend({
        currentPage: 0
      }, this.createState());
    },

    componentDidMount() {
      this.props.store.addChangeListener(this.onChange);
      this.syncPage();
    },

    componentDidUpdate() {
      this.syncPage();
    },

    componentDidUnmount() {
      this.props.store.removeChangeListener(this.onChange);
    },

    syncPage() {
      this.props.store.sync(this.state.currentPage);
    },

    onChange() {
      this.setState(this.createState());
    },

    createState() {
      return this.props.store.get();
    },

    mixins: [Navigation, State],

    setPage: function(index){
      var currentPage = goog.math.clamp(index, 0, this.getMaxPage());
      this.setState({ currentPage });
    },
    setPageSize: function() {
    },
    getMaxPage() {
      return Math.ceil(this.state.total / PER_PAGE);
    },
    getSlicedList() {
      return this.state.list.slice(this.state.currentPage * PER_PAGE, this.state.currentPage * PER_PAGE + PER_PAGE);
    },
    render: function(){
      return (
        <div ref="root" onClick={this.handleClick}>
          <Griddle gridClassName={'paged-table paged-table--' + this.props.cssModifier}
            enableSort={false}
            columns={Columns}
            columnMetadata={ColumnMetadata}
            useExternal={true}
            externalSetPage={this.setPage}
            externalMaxPage={this.getMaxPage()}
            externalChangeSort={function(){}}
            externalSetFilter={function(){}}
            externalCurrentPage={this.state.currentPage}
            externalSetPageSize={this.setPageSize}
            results={this.getSlicedList()}
            tableClassName="table"
            resultsPerPage={PER_PAGE}
            externalSortColumn={null}
            externalSortAscending={true}
            useGriddleStyles={false}
            useCustomPagerComponent={true}
            customPagerComponent={CustomPager} />
        </div>
      );
    },
    handleClick(e) {
      var rowEl;
      if (rowEl = getAncestorFromEventTargetByClass(this.refs.root.getDOMNode(),
          'standard-row', e.target)) {
        var index = _.indexOf(rowEl.parentNode.childNodes, rowEl);
        assert(index >= 0);
        var rowData = this.getSlicedList()[index];
        assert(rowData);
        if (this.props.onClickRow) {
          this.props.onClickRow(rowData);
        }
      }
    }
});

module.exports = ScenarioListComponent;