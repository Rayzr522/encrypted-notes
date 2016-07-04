import React from 'react'
import TinyMCE from 'react-tinymce'

let TinyMCEEditor = React.createClass({
    handleEditorChange(e) {
        this.setState({content: e.target.getContent()})
    },

    getInitialState() {
        return {content: this.props.content}
    },

    setContent(content) {
        this.setState({content: content})
    },

    render() {
        let config = {
            plugins: [
                'advlist autolink lists link image charmap print preview hr anchor pagebreak',
                'searchreplace wordcount visualblocks visualchars code fullscreen',
                'insertdatetime media nonbreaking save table contextmenu directionality',
                'emoticons template paste textcolor colorpicker textpattern imagetools'
            ],
            toolbar1: 'insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image',
            toolbar2: 'print preview media | forecolor backcolor emoticons'
        }
        return (
            <TinyMCE
                onChange={this.handleEditorChange}
                content={this.state.content}
                config={config}
                ref="editor"
            />
        )
    }
})

export default TinyMCEEditor