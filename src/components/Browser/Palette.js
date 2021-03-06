import React from 'react';
import { Router, Route, IndexRoute, Link, IndexLink, hashHistory } from 'react-router';
import Draggable from 'react-draggable';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import Step from './Step';
import {Modes} from '../../const/browser';
import {dispatch, dispatchBrowserStateChange, saveTestCase} from '../../action';
import Executor from '../../core/executor';
import IconButton from 'material-ui/IconButton';
import TextField from 'material-ui/TextField';
import {Tabs, Tab} from 'material-ui/Tabs';
import Divider from 'material-ui/Divider';
import {List, ListItem} from 'material-ui/List';
import Popover from 'material-ui/Popover';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import {getRecordKeyForDisplay} from '../../util';

class StepContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = { isOpened: false };
  }
  render() {
    const children = this.props.testCase.reduce((children, step, i) => {
      if (i > 0) children.push(<Divider key={`${step.id}--divider`} className='palette__divider' />);
      children.push(<Step key={step.id} onTouchTap={this.handleTouchTap.bind(this, step)} {...step} />);
      return children;
    }, []);
    return (
      <List className='palette__body' ref='palette__body'>
        {this.props.isRecording || this.props.isSelecting
          ? <ReactCSSTransitionGroup
             transitionName='step'
             transitionEnterTimeout={900}
             transitionLeaveTimeout={200}
            >{children}</ReactCSSTransitionGroup>
          : children
        }
        <Popover
          open={this.state.isOpened}
          anchorEl={this.state.menuTargetEl}
          anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
          targetOrigin={{horizontal: 'left', vertical: 'top'}}
          onRequestClose={this.handleRequestClose.bind(this)}
        >
          <Menu>
            <MenuItem primaryText='Remove' onTouchTap={this.handleItemRemove.bind(this)} />
            <MenuItem primaryText='Edit' onTouchTap={this.handleItemEdit.bind(this)} />
          </Menu>
        </Popover>
      </List>
    );
  }
  handleRequestClose() {
    this.closeMenu();
  }
  handleTouchTap(step, e) {
    e.preventDefault();
    this.setState({
      isOpened: true,
      menuTargetEl: e.currentTarget,
      menuTargetStep: step,
    });
  }
  handleItemRemove(e) {
    const {menuTargetStep} = this.state;
    if (!menuTargetStep) return;
    dispatch('remove-step', { step: menuTargetStep });
    this.closeMenu();
  }
  handleItemEdit(e) {
    const {menuTargetStep} = this.state;
    if (!menuTargetStep) return;
    // TODO: What we do?
    this.closeMenu();
  }
  closeMenu() {
    this.setState({
      isOpened: false,
      menuTargetEl: null,
      menuTargetStep: null,
    });
  }
}

class Palette extends React.Component {
  render() {
    return (
      <Draggable
        handle='.palette__tabs'
        start={{x: 512, y: 128}}
        ref='draggable'
      >
        <div className='palette' ref='elm'>
          <Tabs className='palette__tabs'
            tabItemContainerStyle={{backgroundColor: 'lightgray'}}
            contentContainerClassName='palette__tab-container'
          >
            <Tab label='steps'>
              <StepContainer {...this.props} />
            </Tab>
            <Tab label='meta' contentContainerStyle={{padding: 16}}>
              <div className='palette-meta-content'>
                <div className='palette-meta-content__item'>
                  <div className='palette-meta-content__label'>Title</div>
                  <TextField
                    style={{width: '100%'}}
                    hintText='Testcase title'
                    value={this.props.testCaseTitle}
                    onChange={e => dispatchBrowserStateChange({testCaseTitle: e.target.value})}
                  ></TextField>
                </div>
                <div className='palette-meta-content__item'>
                  <div className='palette-meta-content__label'>Id</div>
                  <div className='palette-meta-content__value'>{getRecordKeyForDisplay(this.props.testCaseId)}</div>
                </div>
              </div>
            </Tab>
          </Tabs>
          <div className='palette__footer'>
            {this.props.isRecording || this.props.isSelecting
              ? <IconButton className='step-adder__verify'
                    iconClassName='fa fa-location-arrow fa-flip-horizontal'
                    tooltip='Verify element'
                    onClick={onAddVerifyingStepClick}
                ></IconButton>
              : null}
            <IconButton className='palette__playback-btn'
                tooltip='Playback testCase'
                iconClassName='fa fa-fw fa-play'
                onClick={onPlaybackClick.bind(this)}
            ></IconButton>
            <span className='flex-spacer'></span>
            <IconButton
                tooltip='Create new testCase'
                iconClassName='fa fa-fw fa-file-o'
                onClick={onClickNewTestCase.bind(this)}
            ></IconButton>
            <IconButton
                tooltip='Save testCase'
                iconClassName='fa fa-fw fa-save'
                onClick={onClickSaveTestCase.bind(this)}
            ></IconButton>
          </div>
        </div>
      </Draggable>
    );
  }
  componentDidUpdate(prevProps, prevState) {
    // if (this.props.testCase.length > prevProps.testCase.length) {
    //   scrollToBottom.call(this);
    // }
  }
  onDragStop(e) {
    console.log(e.x, e.y);
  }
}

function onClickNewTestCase() {
  dispatchBrowserStateChange({
    mode: Modes.NEUTRAL,
    spotRect: null,
    testCaseId: undefined,
    testCase: [],
    testCaseTitle: '',
  });
}

function onClickSaveTestCase() {
  saveTestCase({
    id: this.props.testCaseId,
    title: this.props.testCaseTitle,
    steps: this.props.testCase,
  });
}

function onAddVerifyingStepClick() {
  dispatch('click-selecting-verify-step');
}

function onPlaybackClick(e) {
  dispatchBrowserStateChange({ mode: Modes.PLAYBACKING });
  Executor.execute({
    id: this.props.testCaseId,
    title: this.props.testCaseTitle,
    steps: this.props.testCase,
  });
}

module.exports = Palette;

function scrollToBottom() {
  this.refs.palette__body.scrollTop = this.refs.palette__body.scrollHeight - this.refs.palette__body.offsetHeight;
}
