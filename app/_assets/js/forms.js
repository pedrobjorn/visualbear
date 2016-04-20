$(document).ready(function() {
    $('form').on('submit', function(e) {

        e.preventDefault();

        var proceed = true;

        $("#mailForm input[required], #mailForm textarea[required]").each(function() {
            $(this).css('border-color', '');

            if (!$.trim($(this).val())) { //if this field is empty
                $(this).css('border-color', 'red'); //change border color to red

                proceed = false; //set do not proceed flag
            }
            //check invalid email
            var email_reg = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;

            if ($(this).attr("type") == "email" && !email_reg.test($.trim($(this).val()))) {
                $(this).css('border-color', 'red'); //change border color to red
                proceed = false; //set do not proceed flag

            }
        });

        if (proceed) //everything looks good! proceed...
        {

            //get input field values data to be sent to server
         var   post_data = {
                'name': $('input[name=name]').val(),
                'email': $('input[name=email]').val(),
                'message': $('textarea[name=message]').val()
            };
            console.log(post_data);
            $.ajax({
                type: "POST",
                url: "../../form-submit.php",
                data: post_data,
                success: function(data) {
                    
                    console.log(data);

                    $('.success').fadeIn(1000);
                    console.log(data);
                }
            });
        }
    });
});
